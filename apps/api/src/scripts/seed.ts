import { pool } from '../db/config'
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

// Test users to create
const testUsers = [
  {
    email: 'buyer@test.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Buyer',
    role: 'PUBLIC',
    phone: '+1234567890',
  },
  {
    email: 'dealer1@test.com',
    password: 'password123',
    firstName: 'Mike',
    lastName: 'Anderson',
    role: 'DEALER',
    phone: '+1234567891',
    dealershipName: 'Premium Auto Sales',
    dealershipLicense: 'DL-12345',
  },
  {
    email: 'dealer2@test.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'DEALER',
    phone: '+1234567892',
    dealershipName: 'City Motors',
    dealershipLicense: 'DL-67890',
  },
  {
    email: 'seller@test.com',
    password: 'password123',
    firstName: 'David',
    lastName: 'Smith',
    role: 'PUBLIC',
    phone: '+1234567893',
  },
  {
    email: 'banker@test.com',
    password: 'password123',
    firstName: 'Emily',
    lastName: 'Brown',
    role: 'BANKER',
    phone: '+1234567894',
    bankInstitution: 'Drive Finance Group',
  },
  {
    email: 'dealer-uk@test.com',
    password: 'password123',
    firstName: 'James',
    lastName: 'Windsor',
    role: 'DEALER',
    phone: '+442071234567',
    dealershipName: 'Royal British Motors',
    dealershipLicense: 'UK-DL-98765',
  },
  {
    email: 'dealer-asia@test.com',
    password: 'password123',
    firstName: 'Wei',
    lastName: 'Chen',
    role: 'DEALER',
    phone: '+8613812345678',
    dealershipName: 'Elite Auto Asia',
    dealershipLicense: 'CN-DL-54321',
  },
  {
    email: 'dealer-japan@test.com',
    password: 'password123',
    firstName: 'Kenji',
    lastName: 'Tanaka',
    role: 'DEALER',
    phone: '+81312345678',
    dealershipName: 'Tokyo Premium Cars',
    dealershipLicense: 'JP-DL-11223',
  },
]

// Sample vehicles to create
const sampleVehicles = [
  {
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    vin: '5YJ3E1EA1KF123456',
    condition: 'NEW',
    mileage: 1200,
    price: 42990,
    currency: 'USD',
    fuelType: 'ELECTRIC',
    transmission: 'AUTOMATIC',
    engineSize: 'Electric Motor',
    color: 'Pearl White',
    description: 'Brand new Tesla Model 3 with autopilot, premium interior, and long range battery. Never been in an accident.',
    features: ['Autopilot', 'Premium Audio', 'Glass Roof', 'Heated Seats'],
    images: ['/uploads/vehicles/tesla-model3.jpg'],
    locationCity: 'San Francisco',
    locationState: 'CA',
    locationCountry: 'USA',
    locationZipCode: '94102',
    status: 'LIVE',
    dealerIndex: 1, // dealer1@test.com
  },
  {
    make: 'BMW',
    model: 'M4',
    year: 2022,
    vin: 'WBS8M9C51NCJ12345',
    condition: 'USED',
    mileage: 8500,
    price: 68500,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '3.0L Twin-Turbo',
    color: 'Alpine White',
    description: 'Stunning BMW M4 in excellent condition. Carbon fiber trim, M Sport exhaust, and competition package.',
    features: ['M Sport Exhaust', 'Carbon Fiber Interior', 'Harmon Kardon Sound', 'Adaptive M Suspension'],
    images: ['/uploads/vehicles/bmw-m4.jpg'],
    locationCity: 'Los Angeles',
    locationState: 'CA',
    locationCountry: 'USA',
    locationZipCode: '90001',
    status: 'LIVE',
    dealerIndex: 2, // dealer2@test.com
  },
  {
    make: 'Toyota',
    model: 'Camry',
    year: 2021,
    vin: '4T1B11HK5MU123456',
    condition: 'USED',
    mileage: 32000,
    price: 24500,
    currency: 'USD',
    fuelType: 'HYBRID',
    transmission: 'AUTOMATIC',
    engineSize: '2.5L Hybrid',
    color: 'Celestial Silver',
    description: 'Reliable Toyota Camry Hybrid with excellent fuel economy. Well maintained, single owner.',
    features: ['Backup Camera', 'Apple CarPlay', 'Lane Departure Warning', 'Adaptive Cruise Control'],
    images: ['/uploads/vehicles/toyota-camry.jpg'],
    locationCity: 'Seattle',
    locationState: 'WA',
    locationCountry: 'USA',
    locationZipCode: '98101',
    status: 'LIVE',
    dealerIndex: 1, // dealer1@test.com
  },
  {
    make: 'Ford',
    model: 'F-150',
    year: 2023,
    vin: '1FTFW1E85NKF12345',
    condition: 'NEW',
    mileage: 450,
    price: 55990,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '3.5L V6 EcoBoost',
    color: 'Agate Black',
    description: 'Brand new Ford F-150 Lariat with FX4 package. Perfect for work and play.',
    features: ['4WD', 'Tow Package', 'Leather Seats', 'B&O Sound System', 'Power Running Boards'],
    images: ['/uploads/vehicles/ford-f150.jpg'],
    locationCity: 'Austin',
    locationState: 'TX',
    locationCountry: 'USA',
    locationZipCode: '73301',
    status: 'LIVE',
    dealerIndex: 2, // dealer2@test.com
  },
  {
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    vin: '2HGFC2F59LH123456',
    condition: 'USED',
    mileage: 45000,
    price: 19900,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'MANUAL',
    engineSize: '2.0L I4',
    color: 'Rallye Red',
    description: 'Fun to drive Honda Civic Sport with manual transmission. Clean title, no accidents.',
    features: ['Sunroof', 'Sport Wheels', 'Honda Sensing', 'LED Headlights'],
    images: ['/uploads/vehicles/honda-civic.jpg'],
    locationCity: 'Miami',
    locationState: 'FL',
    locationCountry: 'USA',
    locationZipCode: '33101',
    status: 'LIVE',
    sellerIndex: 3, // seller@test.com (private seller)
  },
  {
    make: 'Porsche',
    model: '911',
    year: 2022,
    vin: 'WP0AB2A99NS123456',
    condition: 'CERTIFIED_PRE_OWNED',
    mileage: 6800,
    price: 129900,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '3.0L Twin-Turbo',
    color: 'Carrara White',
    description: 'Certified Pre-Owned Porsche 911 Carrera S. Factory warranty remaining, pristine condition.',
    features: ['Sport Chrono', 'PASM', 'Premium Package Plus', 'Bose Surround Sound'],
    images: ['/uploads/vehicles/porsche-911.jpg'],
    locationCity: 'New York',
    locationState: 'NY',
    locationCountry: 'USA',
    locationZipCode: '10001',
    status: 'LIVE',
    dealerIndex: 1, // dealer1@test.com
  },
  {
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2021,
    vin: 'WDDZF4JB1LA123456',
    condition: 'USED',
    mileage: 22000,
    price: 52900,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '2.0L Turbo',
    color: 'Obsidian Black',
    description: 'Luxurious Mercedes-Benz E-Class with AMG styling package. Loaded with features.',
    features: ['AMG Line', 'Panoramic Roof', 'Burmester Sound', '360 Camera', 'Air Suspension'],
    images: ['/uploads/vehicles/mercedes-e-class.jpg'],
    locationCity: 'Chicago',
    locationState: 'IL',
    locationCountry: 'USA',
    locationZipCode: '60601',
    status: 'LIVE',
    dealerIndex: 2, // dealer2@test.com
  },
  {
    make: 'Chevrolet',
    model: 'Corvette',
    year: 2023,
    vin: '1G1YD2D41P5123456',
    condition: 'NEW',
    mileage: 89,
    price: 79995,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '6.2L V8',
    color: 'Torch Red',
    description: 'Brand new C8 Corvette Stingray. Mid-engine supercar performance at an accessible price.',
    features: ['Z51 Performance Package', 'Magnetic Ride Control', 'Performance Exhaust', 'GT2 Seats'],
    images: ['/uploads/vehicles/corvette.jpg'],
    locationCity: 'Dallas',
    locationState: 'TX',
    locationCountry: 'USA',
    locationZipCode: '75201',
    status: 'LIVE',
    dealerIndex: 1, // dealer1@test.com
  },
  // UK Dealership Vehicles
  {
    make: 'Land Rover',
    model: 'Range Rover Sport',
    year: 2023,
    vin: 'SALWA2RK9PA123456',
    condition: 'NEW',
    mileage: 450,
    price: 89500,
    currency: 'GBP',
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    engineSize: '3.0L D300',
    color: 'Santorini Black',
    description: 'Luxurious Range Rover Sport with commanding presence and exceptional off-road capability. Full UK specification.',
    features: ['Terrain Response 2', 'Meridian Sound', 'Panoramic Roof', 'Air Suspension', 'Matrix LED Headlights'],
    images: ['/uploads/vehicles/range-rover-sport.jpg'],
    locationCity: 'London',
    locationState: 'England',
    locationCountry: 'United Kingdom',
    locationZipCode: 'SW1A 1AA',
    status: 'LIVE',
    dealerIndex: 5, // dealer-uk@test.com
  },
  {
    make: 'Jaguar',
    model: 'F-TYPE',
    year: 2022,
    vin: 'SAJD41GX4MCK12345',
    condition: 'CERTIFIED_PRE_OWNED',
    mileage: 8200,
    price: 67500,
    currency: 'GBP',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '5.0L V8 Supercharged',
    color: 'British Racing Green',
    description: 'Stunning Jaguar F-TYPE R with supercharged V8 power. Certified Pre-Owned with full Jaguar warranty.',
    features: ['Adaptive Dynamics', 'Active Sport Exhaust', 'Meridian Audio', 'Performance Seats', 'Carbon Fiber Pack'],
    images: ['/uploads/vehicles/jaguar-ftype.jpg'],
    locationCity: 'Manchester',
    locationState: 'England',
    locationCountry: 'United Kingdom',
    locationZipCode: 'M1 1AA',
    status: 'LIVE',
    dealerIndex: 5, // dealer-uk@test.com
  },
  {
    make: 'Aston Martin',
    model: 'DB11',
    year: 2021,
    vin: 'SCFRMFAW9MGT12345',
    condition: 'USED',
    mileage: 12500,
    price: 145000,
    currency: 'GBP',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '4.0L V8 Twin-Turbo',
    color: 'Midnight Blue',
    description: 'Exquisite Aston Martin DB11 in pristine condition. The perfect blend of performance and luxury.',
    features: ['Sports Plus Pack', 'Bang & Olufsen Audio', 'Heated & Ventilated Seats', '360 Camera', 'Carbon Fiber Trim'],
    images: ['/uploads/vehicles/aston-martin-db11.jpg'],
    locationCity: 'Birmingham',
    locationState: 'England',
    locationCountry: 'United Kingdom',
    locationZipCode: 'B1 1AA',
    status: 'LIVE',
    dealerIndex: 5, // dealer-uk@test.com
  },
  {
    make: 'Bentley',
    model: 'Continental GT',
    year: 2023,
    vin: 'SCBCE8ZA5PC123456',
    condition: 'NEW',
    mileage: 120,
    price: 185000,
    currency: 'GBP',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '4.0L V8',
    color: 'Glacier White',
    description: 'Brand new Bentley Continental GT. Unparalleled luxury and performance from the iconic British marque.',
    features: ['Naim Audio', 'Mulliner Driving Spec', 'Touring Specification', 'City & Touring Spec', 'Diamond Quilted Leather'],
    images: ['/uploads/vehicles/bentley-continental-gt.jpg'],
    locationCity: 'London',
    locationState: 'England',
    locationCountry: 'United Kingdom',
    locationZipCode: 'W1J 7NT',
    status: 'LIVE',
    dealerIndex: 5, // dealer-uk@test.com
  },
  // Asian Dealership Vehicles
  {
    make: 'Lexus',
    model: 'LS 500h',
    year: 2023,
    vin: 'JTHBZ1BL6PA123456',
    condition: 'NEW',
    mileage: 280,
    price: 98000,
    currency: 'USD',
    fuelType: 'HYBRID',
    transmission: 'AUTOMATIC',
    engineSize: '3.5L V6 Hybrid',
    color: 'Sonic Titanium',
    description: 'Ultimate luxury sedan from Lexus. Hybrid efficiency meets uncompromising comfort and Japanese craftsmanship.',
    features: ['Mark Levinson Audio', 'Executive Package', 'Rear Seat Entertainment', 'Four-Zone Climate', 'Kiriko Glass'],
    images: ['/uploads/vehicles/lexus-ls500h.jpg'],
    locationCity: 'Shanghai',
    locationState: 'Shanghai',
    locationCountry: 'China',
    locationZipCode: '200000',
    status: 'LIVE',
    dealerIndex: 6, // dealer-asia@test.com
  },
  {
    make: 'Mercedes-Benz',
    model: 'S-Class',
    year: 2023,
    vin: 'WDDUX8GB4PA123456',
    condition: 'NEW',
    mileage: 150,
    price: 125000,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '3.0L Inline-6 Turbo',
    color: 'Obsidian Black',
    description: 'The flagship Mercedes-Benz S-Class. Cutting-edge technology and unmatched luxury in the executive segment.',
    features: ['MBUX Hyperscreen', 'Burmester 4D Sound', 'Executive Rear Seats', 'E-Active Body Control', 'Ambient Lighting'],
    images: ['/uploads/vehicles/mercedes-s-class.jpg'],
    locationCity: 'Beijing',
    locationState: 'Beijing',
    locationCountry: 'China',
    locationZipCode: '100000',
    status: 'LIVE',
    dealerIndex: 6, // dealer-asia@test.com
  },
  {
    make: 'Audi',
    model: 'RS6 Avant',
    year: 2022,
    vin: 'WAUZZZ4G3DN123456',
    condition: 'USED',
    mileage: 15000,
    price: 85000,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '4.0L V8 Twin-Turbo',
    color: 'Nardo Grey',
    description: 'The ultimate performance estate. Audi RS6 Avant combines supercar performance with everyday practicality.',
    features: ['RS Sport Exhaust', 'Dynamic Plus Package', 'Carbon Ceramic Brakes', 'Bang & Olufsen 3D', 'Matrix LED'],
    images: ['/uploads/vehicles/audi-rs6-avant.jpg'],
    locationCity: 'Hong Kong',
    locationState: 'Hong Kong',
    locationCountry: 'Hong Kong',
    locationZipCode: '999077',
    status: 'LIVE',
    dealerIndex: 6, // dealer-asia@test.com
  },
  {
    make: 'Nissan',
    model: 'GT-R Nismo',
    year: 2023,
    vin: 'JN1AR5EF9PM123456',
    condition: 'NEW',
    mileage: 95,
    price: 210000,
    currency: 'USD',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: '3.8L V6 Twin-Turbo',
    color: 'Stealth Grey',
    description: 'Legendary Nissan GT-R Nismo. Track-focused performance from Japans ultimate supercar.',
    features: ['Nismo Tuned Suspension', 'Carbon Fiber Aero Kit', 'Recaro Bucket Seats', 'Brembo Carbon Brakes', 'Launch Control'],
    images: ['/uploads/vehicles/nissan-gtr-nismo.jpg'],
    locationCity: 'Tokyo',
    locationState: 'Tokyo',
    locationCountry: 'Japan',
    locationZipCode: '100-0001',
    status: 'LIVE',
    dealerIndex: 7, // dealer-japan@test.com
  },
  {
    make: 'Porsche',
    model: 'Taycan Turbo S',
    year: 2023,
    vin: 'WP0AE2Y1XPS123456',
    condition: 'NEW',
    mileage: 320,
    price: 185000,
    currency: 'USD',
    fuelType: 'ELECTRIC',
    transmission: 'AUTOMATIC',
    engineSize: 'Dual Electric Motors',
    color: 'Frozen Blue',
    description: 'Porsches first electric sports car. Breathtaking performance with zero emissions and stunning design.',
    features: ['Sport Chrono', 'PASM', 'Porsche Active Suspension', 'Burmester 3D Sound', '93.4 kWh Battery'],
    images: ['/uploads/vehicles/porsche-taycan-turbo-s.jpg'],
    locationCity: 'Tokyo',
    locationState: 'Tokyo',
    locationCountry: 'Japan',
    locationZipCode: '100-0002',
    status: 'LIVE',
    dealerIndex: 7, // dealer-japan@test.com
  },
]

async function seedDatabase() {
  const client = await pool.connect()

  try {
    console.log('🌱 Starting database seed...\n')

    // Create test users
    console.log('Creating test users...')
    const createdUsers: any[] = []

    for (const user of testUsers) {
      const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS)

      const result = await client.query(
        `INSERT INTO users (
          email, password_hash, first_name, last_name, role, phone,
          dealership_name, dealership_license, bank_institution
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email, first_name, last_name, role`,
        [
          user.email,
          passwordHash,
          user.firstName,
          user.lastName,
          user.role,
          user.phone,
          (user as any).dealershipName || null,
          (user as any).dealershipLicense || null,
          (user as any).bankInstitution || null,
        ]
      )

      if (result.rows.length > 0) {
        createdUsers.push(result.rows[0])
        console.log(`  ✓ Created ${user.role}: ${user.email}`)
      } else {
        // User already exists, fetch it
        const existing = await client.query('SELECT id, email, first_name, last_name, role FROM users WHERE email = $1', [
          user.email,
        ])
        createdUsers.push(existing.rows[0])
        console.log(`  ○ Already exists: ${user.email}`)
      }
    }

    console.log('\nCreating sample vehicles...')
    let vehicleCount = 0

    for (const vehicle of sampleVehicles) {
      // Get seller ID based on index
      let sellerId
      if ('dealerIndex' in vehicle) {
        sellerId = createdUsers[vehicle.dealerIndex]?.id
      } else if ('sellerIndex' in vehicle) {
        sellerId = createdUsers[vehicle.sellerIndex]?.id
      }

      if (!sellerId) {
        console.log(`  ⚠ Skipping vehicle ${vehicle.make} ${vehicle.model} - seller not found`)
        continue
      }

      const result = await client.query(
        `INSERT INTO vehicles (
          seller_id, make, model, year, vin, condition, mileage, price, currency,
          fuel_type, transmission, engine_size, color, description, features, images,
          location_city, location_state, location_country, location_zip_code, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (vin) DO NOTHING
        RETURNING id, make, model, year`,
        [
          sellerId,
          vehicle.make,
          vehicle.model,
          vehicle.year,
          vehicle.vin,
          vehicle.condition,
          vehicle.mileage,
          vehicle.price,
          vehicle.currency,
          vehicle.fuelType,
          vehicle.transmission,
          vehicle.engineSize,
          vehicle.color,
          vehicle.description,
          vehicle.features,
          vehicle.images,
          vehicle.locationCity,
          vehicle.locationState,
          vehicle.locationCountry,
          vehicle.locationZipCode,
          vehicle.status,
        ]
      )

      if (result.rows.length > 0) {
        vehicleCount++
        console.log(`  ✓ Created: ${vehicle.year} ${vehicle.make} ${vehicle.model}`)
      } else {
        console.log(`  ○ Already exists: ${vehicle.year} ${vehicle.make} ${vehicle.model}`)
      }
    }

    console.log('\n✅ Database seeded successfully!')
    console.log(`\nCreated:`)
    console.log(`  - ${createdUsers.length} test users`)
    console.log(`  - ${vehicleCount} vehicles`)
    console.log('\nTest Accounts:')
    console.log('  Buyer: buyer@test.com / password123')
    console.log('  Dealer 1: dealer1@test.com / password123 (Premium Auto Sales)')
    console.log('  Dealer 2: dealer2@test.com / password123 (City Motors)')
    console.log('  Private Seller: seller@test.com / password123')
    console.log('  Banker: banker@test.com / password123')
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Run the seed
seedDatabase()
  .then(() => {
    console.log('\n🎉 Seed complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
