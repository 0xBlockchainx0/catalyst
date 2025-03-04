import { Repository } from '@katalyst/content/repository/Repository'
import { DB_REQUEST_PRIORITY } from '@katalyst/content/repository/RepositoryQueue'
import { SystemPropertiesManager, SystemProperty } from '@katalyst/content/service/system-properties/SystemProperties'
import { ContentFileHash, delay, Timestamp } from 'dcl-catalyst-commons'
import log4js from 'log4js'
import { MetaverseContentService } from '../Service'

export class GarbageCollectionManager {
  private static readonly LOGGER = log4js.getLogger('GarbageCollectionManager')
  private hashesDeletedInLastSweep: Set<ContentFileHash> = new Set()
  private lastTimeOfCollection: Timestamp
  private nextGarbageCollectionTimeout: NodeJS.Timeout
  private stopping = false
  private sweeping = false

  constructor(
    private readonly systemPropertiesManager: SystemPropertiesManager,
    private readonly repository: Repository,
    private readonly service: MetaverseContentService,
    private readonly performGarbageCollection: boolean,
    private readonly sweepInterval: number
  ) {}

  async start(): Promise<void> {
    if (this.performGarbageCollection) {
      this.stopping = false
      const lastCollectionTime = await this.systemPropertiesManager.getSystemProperty(
        SystemProperty.LAST_GARBAGE_COLLECTION_TIME
      )
      this.lastTimeOfCollection = lastCollectionTime ?? 0
      await this.performSweep()
    }
  }

  async stop(): Promise<void> {
    if (this.performGarbageCollection) {
      clearTimeout(this.nextGarbageCollectionTimeout)
      this.stopping = true
      await this.waitUntilSyncFinishes()
    }
  }

  /**
   * When it is time, we will calculate the hashes of all the overwritten deployments, and check if they are not being used by another deployment.
   * If they are not being used, then we will delete them.
   */
  async performSweep() {
    const newTimeOfCollection: Timestamp = Date.now()
    this.sweeping = true
    try {
      await this.repository.tx(
        async (transaction) => {
          const hashes = await transaction.content.findContentHashesNotBeingUsedAnymore(this.lastTimeOfCollection)
          GarbageCollectionManager.LOGGER.debug(`Hashes to delete are: ${hashes}`)
          await this.service.deleteContent(hashes)
          await this.systemPropertiesManager.setSystemProperty(
            SystemProperty.LAST_GARBAGE_COLLECTION_TIME,
            newTimeOfCollection,
            transaction
          )
          this.hashesDeletedInLastSweep = new Set(hashes)
        },
        { priority: DB_REQUEST_PRIORITY.HIGH }
      )
      this.lastTimeOfCollection = newTimeOfCollection
    } catch (error) {
      GarbageCollectionManager.LOGGER.warn(`Failed to perform garbage collection. Reason:\n${error}`)
    } finally {
      if (!this.stopping) {
        this.nextGarbageCollectionTimeout = setTimeout(() => this.performSweep(), this.sweepInterval)
      }
      this.sweeping = false
    }
  }

  deletedInLastSweep(): Set<ContentFileHash> {
    return this.hashesDeletedInLastSweep
  }

  private waitUntilSyncFinishes(): Promise<void> {
    return new Promise(async (resolve) => {
      while (this.sweeping === true) {
        await delay('1s')
      }
      resolve()
    })
  }
}
