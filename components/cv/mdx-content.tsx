import { Children, isValidElement, type JSX, type ReactNode } from 'react'
import Image from 'next/image'
import rehypePrettyCode from 'rehype-pretty-code'
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote-client/rsc'
import type { Locale } from '@/lib/cv/profile'
import { generateSlug } from '@/lib/cv/extract-headings'

function headingText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child)
      if (isValidElement<{ children?: ReactNode }>(child)) return headingText(child.props.children)
      return ''
    })
    .join('')
}

const components: MDXRemoteProps['components'] = {
  h2: ({ children }) => <h2 id={generateSlug(headingText(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={generateSlug(headingText(children))}>{children}</h3>,
  h4: ({ children }) => <h4 id={generateSlug(headingText(children))}>{children}</h4>,
  h5: ({ children }) => <h5 id={generateSlug(headingText(children))}>{children}</h5>,
  h6: ({ children }) => <h6 id={generateSlug(headingText(children))}>{children}</h6>,
  img: ({ src, alt }) => (
    <Image src={typeof src === 'string' ? src : ''} alt={alt ?? ''} width={1200} height={800} />
  ),
}

export default function MDXContent({
  locale = 'zh-TW',
  options,
  ...props
}: JSX.IntrinsicAttributes & MDXRemoteProps & { locale?: Locale }) {
  return (
    <MDXRemote
      {...props}
      options={{
        ...options,
        mdxOptions: {
          ...options?.mdxOptions,
          rehypePlugins: [
            ...(options?.mdxOptions?.rehypePlugins ?? []),
            [
              rehypePrettyCode,
              {
                theme: { dark: 'github-dark-dimmed', light: 'github-light' },
                keepBackground: false,
              },
            ],
          ],
        },
      }}
      components={{
        ...components,
        table: ({ children, ...tableProps }) => (
          <div
            className="typeset-scroll"
            role="region"
            aria-label={locale === 'en' ? 'Table' : '表格'}
            tabIndex={0}
          >
            <table {...tableProps}>{children}</table>
          </div>
        ),
        ...(props.components || {}),
      }}
    />
  )
}
