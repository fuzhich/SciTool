export function CodeBlock({ code }: { code: string }): React.JSX.Element {
  return (
    <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-[12.5px] leading-5 text-zinc-100 dark:bg-black/50">
      <code>{code}</code>
    </pre>
  )
}
