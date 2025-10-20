import cron from 'node-cron'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface BackupSchedule {
  id: string
  name: string
  schedule: string
  type: 'database' | 'files' | 'full'
  retention: number
  isActive: boolean
  lastRun?: Date
  nextRun?: Date
}

interface BackupResult {
  success: boolean
  backupId: string
  size: string
  location: string
  duration: number
  error?: string
}

class BackupScheduler {
  private schedules: Map<string, BackupSchedule> = new Map()
  private tasks: Map<string, cron.ScheduledTask> = new Map()
  private backupDir: string

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups')
    this.ensureBackupDirectory()
    this.loadDefaultSchedules()
  }

  private ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true })
      console.log(`Created backup directory: ${this.backupDir}`)
    }
  }

  private loadDefaultSchedules() {
    // Load default backup schedules
    const defaultSchedules: BackupSchedule[] = [
      {
        id: 'weekly-db',
        name: 'Weekly Database Backup',
        schedule: '0 2 * * 0', // Every Sunday at 2:00 AM
        type: 'database',
        retention: 30,
        isActive: true
      },
      {
        id: 'daily-files',
        name: 'Daily File Backup',
        schedule: '0 1 * * *', // Every day at 1:00 AM
        type: 'files',
        retention: 7,
        isActive: true
      },
      {
        id: 'monthly-full',
        name: 'Monthly Full Backup',
        schedule: '0 0 1 * *', // First day of every month at midnight
        type: 'full',
        retention: 90,
        isActive: true
      }
    ]

    defaultSchedules.forEach(schedule => {
      this.addSchedule(schedule)
    })
  }

  public addSchedule(schedule: BackupSchedule) {
    this.schedules.set(schedule.id, schedule)
    
    if (schedule.isActive) {
      this.startSchedule(schedule.id)
    }
    
    console.log(`Added backup schedule: ${schedule.name} (${schedule.schedule})`)
  }

  public removeSchedule(scheduleId: string) {
    this.stopSchedule(scheduleId)
    this.schedules.delete(scheduleId)
    console.log(`Removed backup schedule: ${scheduleId}`)
  }

  public toggleSchedule(scheduleId: string, isActive: boolean) {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`)
    }

    schedule.isActive = isActive
    
    if (isActive) {
      this.startSchedule(scheduleId)
    } else {
      this.stopSchedule(scheduleId)
    }
    
    console.log(`${isActive ? 'Started' : 'Stopped'} backup schedule: ${scheduleId}`)
  }

  private startSchedule(scheduleId: string) {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) return

    // Stop existing task if any
    this.stopSchedule(scheduleId)

    // Create new cron task
    const task = cron.schedule(schedule.schedule, async () => {
      console.log(`Running scheduled backup: ${schedule.name}`)
      try {
        const result = await this.performBackup(schedule)
        schedule.lastRun = new Date()
        
        if (result.success) {
          console.log(`✅ Backup completed: ${schedule.name} (${result.size})`)
          await this.cleanupOldBackups(schedule)
        } else {
          console.error(`❌ Backup failed: ${schedule.name} - ${result.error}`)
        }
      } catch (error) {
        console.error(`❌ Backup error: ${schedule.name}`, error)
      }
    }, {
      scheduled: true,
      timezone: 'UTC'
    })

    this.tasks.set(scheduleId, task)
    console.log(`Started cron job for: ${schedule.name}`)
  }

  private stopSchedule(scheduleId: string) {
    const task = this.tasks.get(scheduleId)
    if (task) {
      task.stop()
      this.tasks.delete(scheduleId)
      console.log(`Stopped cron job for: ${scheduleId}`)
    }
  }

  private async performBackup(schedule: BackupSchedule): Promise<BackupResult> {
    const startTime = Date.now()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    
    try {
      let backupPath: string
      let backupContent: string

      switch (schedule.type) {
        case 'database':
          backupPath = path.join(this.backupDir, `db_${schedule.id}_${timestamp}.sql`)
          backupContent = await this.createDatabaseBackup()
          break
          
        case 'files':
          backupPath = path.join(this.backupDir, `files_${schedule.id}_${timestamp}.tar.gz`)
          backupContent = await this.createFilesBackup()
          break
          
        case 'full':
          backupPath = path.join(this.backupDir, `full_${schedule.id}_${timestamp}.tar.gz`)
          backupContent = await this.createFullBackup()
          break
          
        default:
          throw new Error(`Unknown backup type: ${schedule.type}`)
      }

      // Write backup content
      if (schedule.type === 'database') {
        fs.writeFileSync(backupPath, backupContent)
      } else {
        // For file/full backups, we would create actual tar.gz files
        // For demo purposes, we'll create a text file
        fs.writeFileSync(backupPath, backupContent)
      }

      // Get file size
      const stats = fs.statSync(backupPath)
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2)
      
      const duration = Date.now() - startTime
      
      return {
        success: true,
        backupId: schedule.id,
        size: `${sizeInMB} MB`,
        location: backupPath,
        duration
      }

    } catch (error) {
      console.error(`Backup failed for ${schedule.name}:`, error)
      
      return {
        success: false,
        backupId: schedule.id,
        size: '0 MB',
        location: '',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async createDatabaseBackup(): Promise<string> {
    // In a real system, you would use pg_dump or similar
    // For demo purposes, we'll create a mock backup
    return `-- Database Backup
-- Generated: ${new Date().toISOString()}
-- Type: Database Backup

-- Mock database dump content
-- In production, this would contain actual database schema and data

SELECT 'Database backup completed successfully' as status;
`
  }

  private async createFilesBackup(): Promise<string> {
    // In a real system, you would tar the files
    return `-- Files Backup
-- Generated: ${new Date().toISOString()}
-- Type: Files Backup

-- Mock files backup content
-- In production, this would be a compressed tar.gz file
`
  }

  private async createFullBackup(): Promise<string> {
    // In a real system, you would backup both database and files
    return `-- Full System Backup
-- Generated: ${new Date().toISOString()}
-- Type: Full Backup

-- Mock full backup content
-- In production, this would include database and all files
`
  }

  private async cleanupOldBackups(schedule: BackupSchedule) {
    try {
      const files = fs.readdirSync(this.backupDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - schedule.retention)

      let deletedCount = 0
      
      for (const file of files) {
        if (file.includes(schedule.id)) {
          const filePath = path.join(this.backupDir, file)
          const stats = fs.statSync(filePath)
          
          if (stats.mtime < cutoffDate) {
            fs.unlinkSync(filePath)
            deletedCount++
            console.log(`Deleted old backup: ${file}`)
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`Cleaned up ${deletedCount} old backups for ${schedule.name}`)
      }
    } catch (error) {
      console.error(`Error cleaning up old backups for ${schedule.name}:`, error)
    }
  }

  public async runBackupNow(scheduleId: string): Promise<BackupResult> {
    const schedule = this.schedules.get(scheduleId)
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`)
    }

    console.log(`Running manual backup: ${schedule.name}`)
    const result = await this.performBackup(schedule)
    schedule.lastRun = new Date()
    
    if (result.success) {
      await this.cleanupOldBackups(schedule)
    }
    
    return result
  }

  public getSchedules(): BackupSchedule[] {
    return Array.from(this.schedules.values())
  }

  public getSchedule(scheduleId: string): BackupSchedule | undefined {
    return this.schedules.get(scheduleId)
  }

  public getStatus() {
    const schedules = this.getSchedules()
    return {
      totalSchedules: schedules.length,
      activeSchedules: schedules.filter(s => s.isActive).length,
      inactiveSchedules: schedules.filter(s => !s.isActive).length,
      schedules: schedules.map(schedule => ({
        ...schedule,
        nextRun: this.getNextRunTime(schedule.schedule)
      }))
    }
  }

  private getNextRunTime(cronExpression: string): Date {
    // This is a simplified calculation
    // In a real system, you'd use a proper cron parser
    const now = new Date()
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next day as fallback
    return nextRun
  }

  public stop() {
    this.tasks.forEach((task, scheduleId) => {
      task.stop()
      console.log(`Stopped backup scheduler for: ${scheduleId}`)
    })
    this.tasks.clear()
  }
}

// Create singleton instance
export const backupScheduler = new BackupScheduler()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down backup scheduler...')
  backupScheduler.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Shutting down backup scheduler...')
  backupScheduler.stop()
  process.exit(0)
})





