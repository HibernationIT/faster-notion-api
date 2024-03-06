import {
  Block,
  Bookmark,
  Breadcrumb,
  BulletedListItem,
  Callout,
  Code,
  Color,
  Column,
  ColumnList,
  Divider,
  Emoji,
  Equation,
  External,
  File,
  Header1,
  Header2,
  Header3,
  Image,
  NumberedListItem,
  Paragraph,
  Quote,
  RichText,
  Table,
  TableRow,
  ToDo,
  Toggle,
  Video,
} from './blockTypes'

export interface RecordValuesRequest {
  requests: {
    pointer: {
      id: string
      spaceId: string
      table: string
    }
    version: number
  }[]
}
export interface RecordValuesResponse {
  recordMap: {
    block: {
      [key: string]: RecordValue
    }
  }
}

export interface RecordValue {
  value: {
    id: string
    version: number
    type: string
    properties: {
      [key: string]: any
    }
    format: any
    content: Array<string>
    created_time: number
    last_edited_time: number
    parent_id: string
    parent_table: string
    alive: boolean
    created_by_table: string
    created_by_id: string
    last_edited_by_table: string
    last_edited_by_id: string
    space_id: string
  }
  role: string
}

export async function getBlock(
  blockId: string,
  spaceId: string,
): Promise<Block> {
  const body: RecordValuesRequest = {
    requests: [
      {
        pointer: {
          id: blockId,
          spaceId: spaceId,
          table: 'block',
        },
        version: -1,
      },
    ],
  }

  return fetch('https://notion.notion.site/api/v3/syncRecordValues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((res: Response) => res.json())
    .then((res: RecordValuesResponse) => {
      const block = res.recordMap.block[blockId]

      const result: Block = {
        object: 'block',
        id: blockId,
        parent: {
          type: 'page',
          block_id: block.value.parent_id,
        },
        created_time: new Date(block.value.created_time).toISOString(),
        last_edited_time: new Date(block.value.last_edited_time).toISOString(),
        created_by: {
          object: 'user',
          id: block.value.created_by_id,
        },
        last_edited_by: {
          object: 'user',
          id: block.value.last_edited_by_id,
        },
        has_children: block.value.content?.length ? true : false,
        archived: true,
        type: block.value.type,
      }

      switch (block.value.type) {
        case 'bookmark':
          return convertBookmark(result, block)
        case 'breadcrumb':
          return convertBreadcumb(result, block)
        case 'bulleted_list':
          return convertBulletedListItem(result, block)
        case 'callout':
          return convertCallout(result, block)
        case 'code':
          return convertCode(result, block)
        case 'column_list':
          return convertColumnList(result, block)
        case 'column':
          return convertColumn(result, block)
        case 'divider':
          return convertDivider(result, block)
        case 'equation':
          return convertEquation(result, block)
        case 'file':
          return convertFile(result, block)
        case 'header':
          return convertHeader1(result, block)
        case 'sub_header':
          return convertHeader2(result, block)
        case 'sub_sub_header':
          return convertHeader3(result, block)
        case 'image':
          return convertImage(result, block)
        case 'numbered_list':
          return convertNumberedListItem(result, block)
        case 'text':
          return convertParagraph(result, block)
        case 'quote':
          return convertQuote(result, block)
        case 'table':
          return convertTable(result, block)
        case 'table_row':
          return convertTableRow(result, block)
        case 'to_do':
          return convertToDo(result, block)
        case 'toggle':
          return convertToggle(result, block)
        case 'video':
          return convertVideo(result, block)
      }

      return result
    })
}

function convertRichText(texts: Array<Array<any>>): Array<RichText> {
  const result: Array<RichText> = []

  if (texts === undefined) return []

  texts.forEach((text) => {
    result.push({
      type: 'text',
      text: {
        content: text[0].toString(),
        link: text[1]?.filter((t: string[]) => t[0] === 'a')[0]
          ? text[1].filter((t: string[]) => t[0] === 'a')[0][1]
          : null,
      },
      annotations: {
        bold: text[1]
          ? text[1].map((t: string[]) => t[0]).includes('b')
          : false,
        italic: text[1]
          ? text[1].map((t: string[]) => t[0]).includes('i')
          : false,
        underline: text[1]
          ? text[1].map((t: string[]) => t[0]).includes('u')
          : false,
        strikethrough: text[1]
          ? text[1].map((t: string[]) => t[0]).includes('s')
          : false,
        code: text[1]
          ? text[1].map((t: string[]) => t[0]).includes('c')
          : false,
        color: text[1]?.filter((t: string[]) => t[0] === 'h')[0]
          ? text[1].filter((t: string[]) => t[0] === 'h')[0][1]
          : 'default',
      },
      plain_text: text[0].toString(),
      href: text[1]?.filter((t: string[]) => t[0] === 'a')[0]
        ? text[1].filter((t: string[]) => t[0] === 'a')[0][1]
        : null,
    })
  })

  return result
}

function convertExternal(page_icon: string): External {
  if (page_icon.startsWith('/')) {
    return {
      type: 'external',
      external: {
        url: 'https://notion.notion.site' + page_icon,
      },
    }
  }
  if (
    page_icon.startsWith('https://prod-files-secure.s3.us-west-2.amazonaws.com')
  ) {
    return {
      type: 'external',
      external: {
        url: 'https://notion.notion.site/image/' + encodeURI(page_icon) + '',
      },
    }
  }
  return {
    type: 'external',
    external: {
      url: page_icon,
    },
  }
}

function convertEmoji(page_icon: string): Emoji {
  return {
    type: 'emoji',
    emoji: page_icon,
  }
}

function convertColor(color: string | undefined): Color {
  if (color === undefined) return 'default'
  if (color === 'teal') return 'green'
  return color as Color
}

function convertBookmark(block: Block, res: RecordValue): Bookmark {
  const result: Bookmark = {
    ...block,
    bookmark: {
      caption: convertRichText(res.value.properties.caption),
      url: res.value.properties.link[0][0],
    },
  }

  return result
}

function convertBreadcumb(block: Block, res: RecordValue): Breadcrumb {
  const result: Breadcrumb = {
    ...block,
    breadcrumb: {},
  }

  return result
}

function convertBulletedListItem(
  block: Block,
  res: RecordValue,
): BulletedListItem {
  const result: BulletedListItem = {
    ...block,
    type: 'bullted_list_item',
    bulleted_list_item: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
    },
  }

  return result
}

function convertCallout(block: Block, res: RecordValue): Callout {
  let icon: Emoji | External

  if (res.value.format.page_icon.match('[a-zA-Z]+')) {
    icon = convertExternal(res.value.format.page_icon)
  } else {
    icon = convertEmoji(res.value.format.page_icon)
  }

  return {
    ...block,
    callout: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
      icon,
    },
  }
}

function convertCode(block: Block, res: RecordValue): Code {
  return {
    ...block,
    code: {
      caption: convertRichText(res.value.properties.caption),
      rich_text: convertRichText(res.value.properties.title),
      language: res.value.properties.ranguage,
    },
  }
}

function convertColumnList(block: Block, res: RecordValue): ColumnList {
  return {
    ...block,
    column_list: {},
  }
}

function convertColumn(block: Block, res: RecordValue): Column {
  return {
    ...block,
    column: {},
  }
}

function convertDivider(block: Block, res: RecordValue): Divider {
  return {
    ...block,
    divider: {},
  }
}

function convertEquation(block: Block, res: RecordValue): Equation {
  return {
    ...block,
    equation: {
      expression: res.value.properties.title[0][0],
    },
  }
}

function convertFile(block: Block, res: RecordValue): File {
  return {
    ...block,
    file: {
      type: 'external',
      caption: convertRichText(res.value.properties.caption),
      name: res.value.properties.title[0][0],
      external: {
        url: res.value.properties.source[0][0],
      },
    },
  }
}

function convertHeader1(block: Block, res: RecordValue): Header1 {
  return {
    ...block,
    type: 'heading_1',
    heading_1: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
      is_toggleable: res.value.format.toggleable,
    },
  }
}

function convertHeader2(block: Block, res: RecordValue): Header2 {
  return {
    ...block,
    type: 'heading_2',
    heading_2: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
      is_toggleable: res.value.format.toggleable,
    },
  }
}

function convertHeader3(block: Block, res: RecordValue): Header3 {
  return {
    ...block,
    type: 'heading_3',
    heading_3: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
      is_toggleable: res.value.format.toggleable,
    },
  }
}

function convertImage(block: Block, res: RecordValue): Image {
  return {
    ...block,
    image: {
      type: 'external',
      external: {
        url: res.value.properties.source[0][0],
      },
    },
  }
}

function convertNumberedListItem(
  block: Block,
  res: RecordValue,
): NumberedListItem {
  return {
    ...block,
    numbered_list_item: {
      color: convertColor(res.value.format.block_color),
      rich_text: convertRichText(res.value.properties.title),
    },
  }
}

function convertParagraph(block: Block, res: RecordValue): Paragraph {
  return {
    ...block,
    type: 'paragraph',
    paragraph: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
    },
  }
}

function convertQuote(block: Block, res: RecordValue): Quote {
  return {
    ...block,
    quote: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
    },
  }
}

function convertTable(block: Block, res: RecordValue): Table {
  return {
    ...block,
    table: {
      table_width: res.value.format.table_block_column_order.length,
      has_column_header: res.value.format.table_block_column_header || false,
      has_row_header: res.value.format.table_block_row_header || false,
    },
  }
}

function convertTableRow(block: Block, res: RecordValue): TableRow {
  return {
    ...block,
    table_row: {
      cells: Object.keys(res.value.properties)
        .sort()
        .map((o) => {
          return convertRichText(res.value.properties[o])
        }),
    },
  }
}

function convertToDo(block: Block, res: RecordValue): ToDo {
  return {
    ...block,
    to_do: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
      checked: res.value.properties.checked[0][0] === 'Yes',
    },
  }
}

function convertToggle(block: Block, res: RecordValue): Toggle {
  return {
    ...block,
    toggle: {
      rich_text: convertRichText(res.value.properties.title),
      color: convertColor(res.value.format.block_color),
    },
  }
}

function convertVideo(block: Block, res: RecordValue): Video {
  return {
    ...block,
    video: {
      type: 'external',
      external: {
        url: res.value.properties.source[0][0],
      },
    },
  }
}
