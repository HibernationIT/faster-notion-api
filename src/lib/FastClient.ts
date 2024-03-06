import { getBlock } from './core/block'
import { getSpaceId } from './core/space'

export class FastClient {
  private spaceDomain: string
  private spaceId: string

  public constructor(spaceDomain: string, spaceId?: string) {
    this.spaceDomain = spaceDomain
    this.spaceId = spaceId || ''
  }

  public readonly space = {
    loadId: async (): Promise<void> => {
      await getSpaceId(this.spaceDomain).then(
        (spaceId) => (this.spaceId = spaceId),
      )
    },
    getId: (): string | undefined => {
      return this.spaceId
    },
  }

  public readonly blocks = {
    retrieve: async ({ block_id }: { block_id: string }): Promise<Object> => {
      const block = await getBlock(block_id, this.spaceId)
      return block
    },
  }
}
