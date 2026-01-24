// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title VehicleEscrow
 * @dev Escrow contract for vehicle transactions with conditional release
 * Supports stablecoin payments (USDC, USDT, DAI)
 */
contract VehicleEscrow is ReentrancyGuard, Ownable {

    enum EscrowStatus {
        Created,
        Funded,
        InspectionPassed,
        DocumentsVerified,
        BuyerConfirmed,
        SellerConfirmed,
        Released,
        Refunded,
        Disputed
    }

    struct Escrow {
        address buyer;
        address seller;
        address paymentToken;
        uint256 amount;
        uint256 vehicleId;
        EscrowStatus status;
        bool inspectionPassed;
        bool documentsVerified;
        bool buyerConfirmed;
        bool sellerConfirmed;
        uint256 createdAt;
        uint256 releasedAt;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(address => bool) public supportedTokens;

    uint256 public escrowCounter;
    uint256 public platformFeePercent = 250; // 2.5% (basis points)
    address public platformFeeReceiver;

    event EscrowCreated(uint256 indexed escrowId, address indexed buyer, address indexed seller, uint256 vehicleId, uint256 amount);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount);
    event ConditionMet(uint256 indexed escrowId, string condition);
    event EscrowReleased(uint256 indexed escrowId, uint256 amount, uint256 fee);
    event EscrowRefunded(uint256 indexed escrowId, uint256 amount);
    event EscrowDisputed(uint256 indexed escrowId);

    constructor(address _platformFeeReceiver) Ownable(msg.sender) {
        platformFeeReceiver = _platformFeeReceiver;
    }

    /**
     * @dev Add supported payment token
     */
    function addSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = true;
    }

    /**
     * @dev Remove supported payment token
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    /**
     * @dev Create new escrow
     */
    function createEscrow(
        address seller,
        address paymentToken,
        uint256 amount,
        uint256 vehicleId
    ) external returns (uint256) {
        require(supportedTokens[paymentToken], "Token not supported");
        require(seller != address(0), "Invalid seller address");
        require(amount > 0, "Amount must be greater than 0");

        uint256 escrowId = escrowCounter++;

        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            paymentToken: paymentToken,
            amount: amount,
            vehicleId: vehicleId,
            status: EscrowStatus.Created,
            inspectionPassed: false,
            documentsVerified: false,
            buyerConfirmed: false,
            sellerConfirmed: false,
            createdAt: block.timestamp,
            releasedAt: 0
        });

        emit EscrowCreated(escrowId, msg.sender, seller, vehicleId, amount);
        return escrowId;
    }

    /**
     * @dev Fund escrow with tokens
     */
    function fundEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Created, "Escrow already funded or invalid");
        require(msg.sender == escrow.buyer, "Only buyer can fund");

        IERC20 token = IERC20(escrow.paymentToken);
        require(token.transferFrom(msg.sender, address(this), escrow.amount), "Transfer failed");

        escrow.status = EscrowStatus.Funded;
        emit EscrowFunded(escrowId, escrow.amount);
    }

    /**
     * @dev Mark inspection as passed (called by platform)
     */
    function markInspectionPassed(uint256 escrowId) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status == EscrowStatus.Funded || escrow.status > EscrowStatus.Funded, "Invalid status");

        escrow.inspectionPassed = true;
        if (escrow.status == EscrowStatus.Funded) {
            escrow.status = EscrowStatus.InspectionPassed;
        }

        emit ConditionMet(escrowId, "InspectionPassed");
    }

    /**
     * @dev Mark documents as verified (called by platform)
     */
    function markDocumentsVerified(uint256 escrowId) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status >= EscrowStatus.Funded, "Invalid status");

        escrow.documentsVerified = true;
        if (escrow.status == EscrowStatus.InspectionPassed) {
            escrow.status = EscrowStatus.DocumentsVerified;
        }

        emit ConditionMet(escrowId, "DocumentsVerified");
    }

    /**
     * @dev Buyer confirms receipt
     */
    function buyerConfirm(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer, "Only buyer can confirm");
        require(escrow.status >= EscrowStatus.DocumentsVerified, "Conditions not met");

        escrow.buyerConfirmed = true;
        escrow.status = EscrowStatus.BuyerConfirmed;

        emit ConditionMet(escrowId, "BuyerConfirmed");

        // Auto-release if seller already confirmed
        if (escrow.sellerConfirmed) {
            _releaseEscrow(escrowId);
        }
    }

    /**
     * @dev Seller confirms delivery
     */
    function sellerConfirm(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.seller, "Only seller can confirm");
        require(escrow.status >= EscrowStatus.DocumentsVerified, "Conditions not met");

        escrow.sellerConfirmed = true;
        escrow.status = EscrowStatus.SellerConfirmed;

        emit ConditionMet(escrowId, "SellerConfirmed");

        // Auto-release if buyer already confirmed
        if (escrow.buyerConfirmed) {
            _releaseEscrow(escrowId);
        }
    }

    /**
     * @dev Release funds to seller
     */
    function _releaseEscrow(uint256 escrowId) internal {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.buyerConfirmed && escrow.sellerConfirmed, "Both parties must confirm");
        require(escrow.status != EscrowStatus.Released, "Already released");

        uint256 fee = (escrow.amount * platformFeePercent) / 10000;
        uint256 sellerAmount = escrow.amount - fee;

        IERC20 token = IERC20(escrow.paymentToken);
        require(token.transfer(escrow.seller, sellerAmount), "Transfer to seller failed");
        require(token.transfer(platformFeeReceiver, fee), "Fee transfer failed");

        escrow.status = EscrowStatus.Released;
        escrow.releasedAt = block.timestamp;

        emit EscrowReleased(escrowId, sellerAmount, fee);
    }

    /**
     * @dev Refund to buyer (only if conditions not met or dispute resolved)
     */
    function refundEscrow(uint256 escrowId) external onlyOwner {
        Escrow storage escrow = escrows[escrowId];
        require(escrow.status != EscrowStatus.Released, "Already released");
        require(escrow.status != EscrowStatus.Refunded, "Already refunded");

        IERC20 token = IERC20(escrow.paymentToken);
        require(token.transfer(escrow.buyer, escrow.amount), "Refund failed");

        escrow.status = EscrowStatus.Refunded;
        emit EscrowRefunded(escrowId, escrow.amount);
    }

    /**
     * @dev Mark escrow as disputed
     */
    function markDisputed(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        require(msg.sender == escrow.buyer || msg.sender == escrow.seller, "Not authorized");
        require(escrow.status != EscrowStatus.Released && escrow.status != EscrowStatus.Refunded, "Cannot dispute");

        escrow.status = EscrowStatus.Disputed;
        emit EscrowDisputed(escrowId);
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = newFeePercent;
    }

    /**
     * @dev Update platform fee receiver
     */
    function updatePlatformFeeReceiver(address newReceiver) external onlyOwner {
        require(newReceiver != address(0), "Invalid address");
        platformFeeReceiver = newReceiver;
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }
}
