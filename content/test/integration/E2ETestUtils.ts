import { ControllerEntityFactory } from '@katalyst/content/controller/ControllerEntityFactory'
import { retry } from '@katalyst/content/helpers/RetryHelper'
import { Entity } from '@katalyst/content/service/Entity'
import { EntityFactory } from '@katalyst/content/service/EntityFactory'
import { DeploymentResult, MetaverseContentService } from '@katalyst/content/service/Service'
import { DeploymentBuilder, DeploymentData } from 'dcl-catalyst-client'
import { Entity as ControllerEntity, EntityType, EntityVersion, Pointer, Timestamp } from 'dcl-catalyst-commons'
import { Authenticator, EthAddress } from 'dcl-crypto'
import EthCrypto from 'eth-crypto'
import fs from 'fs'
import path from 'path'

export async function buildDeployDataAfterEntity(
  afterEntity: { timestamp: Timestamp } | { entity: { timestamp: Timestamp } },
  pointers: Pointer[],
  options?: Exclude<DeploymentOptions, 'timestamp'>
): Promise<EntityCombo> {
  const after = 'timestamp' in afterEntity ? afterEntity.timestamp : afterEntity.entity.timestamp
  const timestamp = Math.max(options?.timestamp ?? Date.now(), after + 1)
  const opts = Object.assign({ timestamp }, options)
  return buildDeployData(pointers, opts)
}

export async function buildDeployData(pointers: Pointer[], options?: DeploymentOptions): Promise<EntityCombo> {
  const opts = Object.assign(
    {
      type: EntityType.SCENE,
      timestamp: Date.now(),
      metadata: 'metadata',
      contentPaths: [],
      identity: createIdentity()
    },
    options
  )
  const buffers: Map<string, Buffer> | undefined =
    opts.contentPaths.length > 0
      ? new Map(opts.contentPaths.map((filePath) => [path.basename(filePath), fs.readFileSync(filePath)]))
      : undefined

  const deploymentPreparationData = await DeploymentBuilder.buildEntity(
    opts.type,
    pointers,
    buffers,
    opts.metadata,
    opts.timestamp
  )
  const [, signature] = hashAndSignMessage(deploymentPreparationData.entityId, opts.identity)
  const authChain = Authenticator.createSimpleAuthChain(
    deploymentPreparationData.entityId,
    opts.identity.address,
    signature
  )

  const entity: Entity = EntityFactory.fromBufferWithId(
    deploymentPreparationData.files.get(deploymentPreparationData.entityId)!,
    deploymentPreparationData.entityId
  )

  if (!entity.content || entity.content.size === 0) {
    delete entity.content
  }

  const deployData: DeploymentData = {
    entityId: entity.id,
    authChain: authChain,
    files: deploymentPreparationData.files
  }

  const controllerEntity = ControllerEntityFactory.maskEntity(entity)

  if (!controllerEntity.content || controllerEntity.content.length === 0) {
    delete controllerEntity.content
  }

  return { deployData, entity, controllerEntity }
}

export function hashAndSignMessage(message: string, identity: Identity = createIdentity()) {
  const messageHash = Authenticator.createEthereumMessageHash(message)
  const signature = EthCrypto.sign(identity.privateKey, messageHash)
  return [identity.address, signature]
}

export function createIdentity(): Identity {
  return EthCrypto.createIdentity()
}

export function deleteFolderRecursive(pathToDelete: string) {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach((file) => {
      const curPath = path.join(pathToDelete, file)
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath)
      } else {
        // delete file
        fs.unlinkSync(curPath)
      }
    })
    fs.rmdirSync(pathToDelete)
  }
}

export function awaitUntil(
  evaluation: () => Promise<any>,
  attempts: number = 10,
  waitBetweenAttempts: string = '1s'
): Promise<void> {
  return retry(evaluation, attempts, 'perform assertion', waitBetweenAttempts)
}

/** Returns the deployment timestamp of the last deployed entity */
export async function deployEntitiesCombo(
  service: MetaverseContentService,
  ...entitiesCombo: EntityCombo[]
): Promise<DeploymentResult> {
  let deploymentResult: DeploymentResult = { errors: [] }
  for (const { deployData } of entitiesCombo) {
    deploymentResult = await service.deployEntity(
      Array.from(deployData.files.values()),
      deployData.entityId,
      { authChain: deployData.authChain, version: EntityVersion.V2 },
      ''
    )
  }
  return deploymentResult
}

export type Identity = {
  address: EthAddress
  privateKey: string
}

type DeploymentOptions = {
  type?: EntityType
  timestamp?: Timestamp
  metadata?: any
  contentPaths?: string[]
  identity?: Identity
}

export type EntityCombo = {
  deployData: DeploymentData
  controllerEntity: ControllerEntity
  entity: Entity
}
