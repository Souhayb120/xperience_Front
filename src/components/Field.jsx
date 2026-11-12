import { useId } from 'react'

// a label, an input and its error just below (the error comes from the backend: { field: message })
export default function Field({ label, hint, error, as = 'input', ...inputProps }) {
  const id = useId()
  const Tag = as
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <Tag
        id={id}
        className={as === 'textarea' ? 'textarea' : 'input'}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && <span id={`${id}-hint`} className="hint">{hint}</span>}
      {error && <span id={`${id}-error`} className="field-error">{error}</span>}
    </div>
  )
}
