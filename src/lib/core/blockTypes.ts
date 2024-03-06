export type Color =
  | 'blue'
  | 'blue_background'
  | 'brown'
  | 'brown_background'
  | 'default'
  | 'gray'
  | 'gray_background'
  | 'green'
  | 'green_background'
  | 'orange'
  | 'orange_background'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'pink_background'
  | 'purple'
  | 'purple_background'
  | 'red'
  | 'red_background'
  | 'yellow_background'

export interface Emoji {
  type: 'emoji'
  emoji: string
}

export interface External {
  type: 'external'
  external: {
    url: string
  }
}

export interface RichText {
  type: string
  text: {
    content: string
    link: string
  }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: Color
  }
  plain_text: string
  href: string
}

export interface Block {
  object: 'block'
  id: string
  parent: {
    type: string
    block_id: string
  }
  created_time: string
  last_edited_time: string
  created_by: {
    object: string
    id: string
  }
  last_edited_by: {
    object: string
    id: string
  }
  has_children: boolean
  archived: boolean
  type: string
}

export interface Bookmark extends Block {
  bookmark: {
    caption: Array<RichText>
    url: string
  }
}

export interface Breadcrumb extends Block {
  breadcrumb: {}
}

export interface BulletedListItem extends Block {
  bulleted_list_item: {
    rich_text: Array<RichText>
    color: Color
  }
}

export interface Callout extends Block {
  callout: {
    rich_text: Array<RichText>
    icon: Emoji | External
    color: Color
  }
}

export interface Code extends Block {
  code: {
    caption: Array<RichText>
    rich_text: Array<RichText>
    language: string
  }
}

export interface ColumnList extends Block {
  column_list: {}
}

export interface Column extends Block {
  column: {}
}

export interface Divider extends Block {
  divider: {}
}

export interface Equation extends Block {
  equation: {
    expression: string
  }
}

export interface File extends Block {
  file: {
    caption: RichText[]
    name: string
  } & External
}

export interface Heading {
  rich_text: RichText[]
  color: string
  is_toggleable: boolean
}

export interface Header1 extends Block {
  heading_1: Heading
}

export interface Header2 extends Block {
  heading_2: Heading
}

export interface Header3 extends Block {
  heading_3: Heading
}

export interface Image extends Block {
  image: External
}

export interface NumberedListItem extends Block {
  numbered_list_item: {
    rich_text: RichText[]
    color: string
  }
}

export interface Paragraph extends Block {
  paragraph: {
    rich_text: RichText[]
    color: string
  }
}

export interface Quote extends Block {
  quote: {
    rich_text: RichText[]
    color: string
  }
}

export interface Table extends Block {
  table: {
    table_width: number
    has_column_header: boolean
    has_row_header: boolean
  }
}

export interface TableRow extends Block {
  table_row: {
    cells: RichText[][]
  }
}

export interface ToDo extends Block {
  to_do: {
    rich_text: RichText[]
    checked: boolean
    color: string
  }
}

export interface Toggle extends Block {
  toggle: {
    rich_text: RichText[]
    color: string
  }
}

export interface Video extends Block {
  video: External
}
