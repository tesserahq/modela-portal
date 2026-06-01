/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'

interface HighlightedPre extends React.HTMLAttributes<HTMLPreElement> {
  children: string
  language: string
}

const HighlightedPre = React.memo(({ children, language, ...props }: HighlightedPre) => {
  const [tokens, setTokens] = useState<any>(null)
  const [bundledLanguages, setBundledLanguages] = useState<any>(null)

  useEffect(() => {
    let isMounted = true

    const loadShiki = async () => {
      const { codeToTokens, bundledLanguages } = await import('shiki')

      if (isMounted) {
        setBundledLanguages(bundledLanguages)
        if (!(language in bundledLanguages)) {
          return
        }

        const { tokens } = await codeToTokens(children, {
          lang: language as keyof typeof bundledLanguages,
          defaultColor: false,
          themes: {
            light: 'github-light',
            dark: 'github-dark',
          },
        })

        setTokens(tokens)
      }
    }

    loadShiki()

    return () => {
      isMounted = false
    }
  }, [children, language])

  if (!bundledLanguages || !(language in bundledLanguages) || !tokens) {
    return <pre {...props}>{children}</pre>
  }

  return (
    <pre {...props}>
      <code>
        {tokens.map((line: any, lineIndex: any) => (
          <React.Fragment key={lineIndex}>
            <span>
              {line.map((token: any, tokenIndex: any) => {
                const style = typeof token.htmlStyle === 'string' ? undefined : token.htmlStyle

                return (
                  <span
                    key={tokenIndex}
                    className="bg-shiki-light-bg text-shiki-light dark:bg-shiki-dark-bg
                      dark:text-shiki-dark"
                    style={style}>
                    {token.content}
                  </span>
                )
              })}
            </span>
            {lineIndex !== tokens.length - 1 && '\n'}
          </React.Fragment>
        ))}
      </code>
    </pre>
  )
})

HighlightedPre.displayName = 'HighlightedCode'

export { HighlightedPre }
