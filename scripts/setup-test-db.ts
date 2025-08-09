import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'
import fs from 'fs'

/**
 * E2Eテスト用データベースのセットアップスクリプト
 * ローカルSQLiteファイルを作成し、マイグレーションを実行します
 */
async function setupTestDatabase() {
  console.log('🔄 Setting up test database...')
  
  // 既存のテストDBファイルを削除
  if (fs.existsSync('./test.db')) {
    fs.unlinkSync('./test.db')
    console.log('🗑️  Removed existing test.db')
  }

  // テスト用データベース接続
  const db = drizzle({
    connection: {
      url: 'file:./test.db'
    }
  })

  try {
    // マイグレーション実行
    await migrate(db, { migrationsFolder: './migrations' })
    console.log('✅ Test database migration completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// スクリプト直接実行時のみ実行
if (require.main === module) {
  setupTestDatabase()
    .then(() => {
      console.log('🎉 Test database setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test database setup failed:', error)
      process.exit(1)
    })
}

export { setupTestDatabase }