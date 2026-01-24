import { pool } from '../db/config'

// Update existing vehicles with new image paths
const imageUpdates = [
  { vin: '5YJ3E1EA1KF123456', images: ['/uploads/vehicles/tesla-model3.jpg'] },
  { vin: 'WBS8M9C51NCJ12345', images: ['/uploads/vehicles/bmw-m4.jpg'] },
  { vin: '4T1B11HK5MU123456', images: ['/uploads/vehicles/toyota-camry.jpg'] },
  { vin: '1FTFW1E85NKF12345', images: ['/uploads/vehicles/ford-f150.jpg'] },
  { vin: '2HGFC2F59LH123456', images: ['/uploads/vehicles/honda-civic.jpg'] },
  { vin: 'WP0AB2A99NS123456', images: ['/uploads/vehicles/porsche-911.jpg'] },
  { vin: 'WDDZF4JB1LA123456', images: ['/uploads/vehicles/mercedes-e-class.jpg'] },
  { vin: '1G1YD2D41P5123456', images: ['/uploads/vehicles/corvette.jpg'] },
]

async function updateVehicleImages() {
  const client = await pool.connect()

  try {
    console.log('🖼️  Updating vehicle images...\n')

    for (const { vin, images } of imageUpdates) {
      const result = await client.query(
        'UPDATE vehicles SET images = $1 WHERE vin = $2 RETURNING make, model, year',
        [images, vin]
      )

      if (result.rows.length > 0) {
        const vehicle = result.rows[0]
        console.log(`  ✓ Updated: ${vehicle.year} ${vehicle.make} ${vehicle.model}`)
      } else {
        console.log(`  ⚠ Not found: VIN ${vin}`)
      }
    }

    console.log('\n✅ Image update complete!')
  } catch (error) {
    console.error('❌ Error updating images:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

updateVehicleImages()
  .then(() => {
    console.log('\n🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Update failed:', error)
    process.exit(1)
  })
