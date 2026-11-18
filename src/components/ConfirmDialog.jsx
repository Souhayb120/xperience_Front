import { useEffect, useRef } from 'react'

// "Are you sure?" box, same native <dialog> as the logout one: showModal() gives the backdrop,
// focus trap and Escape (= Non); close() puts the focus back on the button that opened it.
export default function ConfirmDialog({ title, text, yesLabel, onYes, onNo }) {
  const ref = useRef(null)
  useEffect(() => { ref.current?.showModal() }, [])
  const cancel = () => ref.current?.close()
  return (
    // the padding is on the inner box: a click on the dialog element itself can only be on the backdrop
    <dialog ref={ref} className="confirm-dialog" aria-labelledby="confirm-title" onClose={onNo}
            onClick={(event) => { if (event.target === ref.current) cancel() }}>
      <div className="confirm-box">
        <h2 id="confirm-title">{title}</h2>
        <p className="muted">{text}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-ghost" onClick={cancel} autoFocus>Non</button>
          <button type="button" className="btn btn-danger" onClick={onYes}>{yesLabel}</button>
        </div>
      </div>
    </dialog>
  )
}
