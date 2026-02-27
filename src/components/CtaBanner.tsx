interface Props {
  text: string
  linkText: string
  url: string
  visible?: boolean
}

export function CtaBanner({ text, linkText, url, visible = true }: Props) {
  if (!visible) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="cta-glow-wrapper block no-underline"
    >
      <span className="cta-glow-inner">
        <p className="text-sm text-wv-text mb-0.5">{text}</p>
        <span className="text-sm font-semibold bg-gradient-to-r from-[#00d4ff] via-[#6200ff] to-[#b000ff] bg-clip-text text-transparent">
          {linkText}
        </span>
      </span>
    </a>
  )
}
