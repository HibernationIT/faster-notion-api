export interface spaceIdRequest {
  type: string
  name: string
  spaceDomain: string
  requestedOnPublicDomain: boolean
}
export interface spaceIdResponse {
  spaceName: string
  spaceId: string
  spaceDomain: string
  canJoinSpace: boolean
  icon: string
  userHasExplicitAccess: boolean
  betaEnabled: boolean
  canRequestAccess: boolean
  requireLogin: boolean
  publicAccessRole: string
  securitySettings: {
    publicAccess: {
      disabled: boolean
    }
    disableExport: {
      disabled: boolean
    }
  }
}

/**
 * Function to get spaceId through spaceDomain (Notion page domain)
 * @param {string} spaceDomain {spaceDomain}.notion.site
 * @returns {Promise<string>} spaceId
 */
export async function getSpaceId(spaceDomain: string): Promise<string> {
  const body: spaceIdRequest = {
    type: 'block-space',
    name: 'space',
    spaceDomain,
    requestedOnPublicDomain: false,
  }

  return fetch('https://www.notion.so/api/v3/getPublicPageData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((res: Response) => res.json())
    .then((res: spaceIdResponse) => res.spaceId)
}
