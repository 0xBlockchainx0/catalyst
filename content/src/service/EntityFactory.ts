import { ContentFileHash, EntityId, EntityType, Pointer } from 'dcl-catalyst-commons'
import { Entity } from './Entity'

export class EntityFactory {
  static fromBufferWithId(buffer: Buffer, id: EntityId): Entity {
    const object = EntityFactory.parseJsonIntoObject(buffer)
    return EntityFactory.fromObject(object, id)
  }

  static fromJsonObject(object: any): Entity {
    if (!object.id) {
      throw new Error(`Expected to find a defined id`)
    }
    return EntityFactory.fromObject(object, object.id)
  }

  private static parseJsonIntoObject(buffer: Buffer): any {
    try {
      return JSON.parse(buffer.toString())
    } catch (e) {
      throw new Error(`Failed to parse the entity file. Please make sure that it is a valid json.`)
    }
  }

  private static fromObject(object: any, id: EntityId): Entity {
    if (!object.type || !Object.values(EntityType).includes(object.type)) {
      throw new Error(
        `Please set a valid type. It must be one of ${Object.values(EntityType)}. We got '${object.type}'`
      )
    }
    if (!object.pointers || !Array.isArray(object.pointers) || !this.isPointerArray(object.pointers)) {
      throw new Error(`Please set valid pointers`)
    }
    if (!object.timestamp || typeof object.timestamp != 'number') {
      throw new Error(`Please set a valid timestamp. We got ${object.timestamp}`)
    }

    let content: Map<string, ContentFileHash> | undefined = undefined
    if (object.content) {
      if (!Array.isArray(object.content)) {
        throw new Error(`Expected an array as content`)
      }
      content = this.parseContent(object.content)
    }

    const type: EntityType = EntityType[object.type.toUpperCase().trim()]
    return {
      id,
      type,
      pointers: object.pointers.map((pointer: Pointer) => pointer.toLowerCase()),
      timestamp: object.timestamp,
      content,
      metadata: object.metadata
    }
  }

  private static parseContent(contents: any[]): Map<string, ContentFileHash> {
    const entries: [string, ContentFileHash][] = contents.map((content) => {
      if (!content.file || !content.hash) {
        throw new Error('Content must contain a file name and a file hash')
      }

      if (!this.isString(content.file) || !this.isString(content.hash)) {
        throw new Error('Please make sure that all file names and a file hashes are valid strings')
      }

      return [content.file, content.hash]
    })
    return new Map(entries)
  }

  private static isPointerArray<T>(array: T[]): boolean {
    return array.every(this.isString)
  }

  private static isString(value: any): boolean {
    return typeof value === 'string' || value instanceof String
  }
}
