import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpImage } from '../lib/expdoc'
import { MAX_IMAGE_BYTES, newId } from '../lib/expdoc'
import { btnDanger, btnPrimary, inputCls } from './ui'

export function ImageSection({
  images,
  onChange
}: {
  images: ExpImage[]
  onChange: (next: ExpImage[]) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  const onFiles = (files: FileList | null): void => {
    setMessage(null)
    const added: ExpImage[] = []
    let pending = Array.from(files ?? []).length
    for (const f of Array.from(files ?? [])) {
      if (!f.type.startsWith('image/')) {
        pending--
        setMessage({ text: t('editor.imageInvalid'), ok: false })
        continue
      }
      if (f.size > MAX_IMAGE_BYTES) {
        pending--
        setMessage({ text: t('editor.imageTooBig'), ok: false })
        continue
      }
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        added.push({
          id: newId('img'),
          name: f.name.replace(/\.[^.]+$/, ''),
          caption: '',
          mimeType: f.type || 'image/png',
          dataBase64: dataUrl.split(',')[1] ?? ''
        })
        pending--
        if (pending === 0) onChange([...images, ...added])
      }
      reader.readAsDataURL(f)
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const patch = (id: string, field: keyof ExpImage, value: string): void => {
    onChange(images.map((img) => (img.id === id ? { ...img, [field]: value } : img)))
  }
  const remove = (img: ExpImage): void => {
    if (!window.confirm(t('editor.imageRemoveConfirm', { name: img.name || '?' }))) return
    onChange(images.filter((x) => x.id !== img.id))
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <button type="button" className={btnPrimary} onClick={() => fileRef.current?.click()}>
          {t('editor.upload')}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
        {message && (
          <span className={`text-[12px] ${message.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
            {message.text}
          </span>
        )}
      </div>
      {images.length === 0 && <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500">—</p>}
      <div className="grid grid-cols-2 gap-3">
        {images.map((img) => (
          <div key={img.id} className="rounded-lg border border-zinc-200 p-2.5 dark:border-zinc-800">
            <img
              src={`data:${img.mimeType};base64,${img.dataBase64}`}
              alt={img.caption || img.name}
              className="mb-2 max-h-40 w-full rounded-md object-contain"
            />
            <div className="space-y-1.5">
              <input
                className={`${inputCls} w-full`}
                placeholder={t('editor.imageName')}
                value={img.name}
                onChange={(e) => patch(img.id, 'name', e.target.value)}
              />
              <input
                className={`${inputCls} w-full`}
                placeholder={t('editor.imageCaption')}
                value={img.caption}
                onChange={(e) => patch(img.id, 'caption', e.target.value)}
              />
            </div>
            <div className="mt-1.5 flex justify-end">
              <button type="button" className={btnDanger} onClick={() => remove(img)}>
                {t('editor.remove')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
