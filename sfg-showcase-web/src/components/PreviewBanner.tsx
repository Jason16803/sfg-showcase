import './PreviewBanner.scss'

export function PreviewBanner() {
  return (
    <div className="preview-banner">
      <div className="preview-banner__content">
        <span className="preview-banner__badge">Preview Mode</span>
        <p className="preview-banner__text">
          This is a preview of the dashboard. Authentication will be required in the next phase.
        </p>
      </div>
    </div>
  )
}
