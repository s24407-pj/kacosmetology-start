const FORBIDDEN_NODE_TYPES = new Set([
  'mdxjsEsm',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
  'mdxFlowExpression',
  'mdxTextExpression',
  'html',
  'image',
  'imageReference',
])

type UnistNode = {
  type: string
  children?: UnistNode[]
  position?: {
    start?: { line?: number; column?: number }
  }
}

const walk = (node: UnistNode, visit: (node: UnistNode) => void) => {
  visit(node)
  if (!node.children) return
  for (const child of node.children) walk(child, visit)
}

const formatPosition = (node: UnistNode) => {
  const line = node.position?.start?.line
  const column = node.position?.start?.column
  if (line == null) return ''
  return column == null
    ? ` (line ${line})`
    : ` (line ${line}, column ${column})`
}

/**
 * Unified remark plugin: Markdown-only MDX bodies (cover images via frontmatter only).
 * Shared by generate-blog-content (@mdx-js/mdx) and Vite (@mdx-js/rollup).
 */
export function blogMdxPolicy() {
  return (tree: UnistNode) => {
    walk(tree, (node) => {
      if (!FORBIDDEN_NODE_TYPES.has(node.type)) return
      throw new Error(
        `Blog MDX policy rejected node type "${node.type}"${formatPosition(node)}. ` +
          'Articles must be Markdown-only: no imports, exports, JSX, expressions, raw HTML, or body images.',
      )
    })
  }
}

export const BLOG_MDX_FORBIDDEN_NODE_TYPES = FORBIDDEN_NODE_TYPES
