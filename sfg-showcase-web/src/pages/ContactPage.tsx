import { useState, type FormEvent, type ChangeEvent } from 'react'
import { Container, Card, Button } from '@/components'
import './ContactPage.scss'

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error'

interface FormData {
  firstName: string
  lastName:  string
  email:     string
  company:   string
  subject:   string
  message:   string
}

const EMPTY: FormData = {
  firstName: '',
  lastName:  '',
  email:     '',
  company:   '',
  subject:   '',
  message:   '',
}

// Inline SVG icons — no emoji, no OS-dependent rendering
function IconEmail()    { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 7l8 5 8-5" stroke="currentColor" strokeWidth="1.5"/></svg> }
function IconLocation() { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 2a6 6 0 00-6 6c0 4 6 10 6 10s6-6 6-10a6 6 0 00-6-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/></svg> }
function IconClock()    { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> }
function IconSupport()  { return <svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M7.5 7.5a2.5 2.5 0 015 0c0 2-2.5 2.5-2.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="10" cy="15" r=".75" fill="currentColor"/></svg> }

const CONTACT_ITEMS = [
  { Icon: IconEmail,    label: 'Email us',      value: 'hello@smithforgd.com',          accent: 'primary' },
  { Icon: IconLocation, label: 'Headquartered', value: 'Tallahassee, FL · Valdosta, GA', accent: 'info'    },
  { Icon: IconClock,    label: 'Response time', value: 'Within 1 business day',          accent: 'success' },
  { Icon: IconSupport,  label: 'Support hours', value: 'Mon – Fri, 9am – 6pm ET',        accent: 'warning' },
]

export function ContactPage() {
  const [form,   setForm]   = useState<FormData>(EMPTY)
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errors, setErrors] = useState<Partial<FormData>>({})

  function change(field: keyof FormData) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  function validate(): boolean {
    const e: Partial<FormData> = {}
    if (!form.firstName.trim())     e.firstName = 'Required'
    if (!form.lastName.trim())      e.lastName  = 'Required'
    if (!form.email.includes('@'))  e.email     = 'Enter a valid email'
    if (!form.message.trim())       e.message   = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    // Simulated delay — wire to POST /api/v1/contact when backend endpoint is ready
    await new Promise((r) => setTimeout(r, 900))
    console.log('[Contact form submitted]', form)
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <div className="contact-page">
        <section className="contact-success-page">
          <Container>
            <div className="contact-success">
              <div className="contact-success__ring" aria-hidden="true">
                <svg viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
                  <path d="M12 20l6 6 10-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2>Message sent!</h2>
              <p>
                Thanks for reaching out, {form.firstName || 'there'}.
                We&rsquo;ll get back to you within one business day.
              </p>
              <Button
                variant="primary"
                onClick={() => { setForm(EMPTY); setStatus('idle') }}
              >
                Send another message
              </Button>
            </div>
          </Container>
        </section>
      </div>
    )
  }

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <Container>
          <div className="contact-hero__eyebrow">Get in touch</div>
          <h1 className="contact-hero__title">Contact us</h1>
          <p className="contact-hero__sub">
            Questions about the platform, pricing, or your account? We&rsquo;re here to help.
          </p>
        </Container>
      </section>

      {/* Body */}
      <section className="contact-body">
        <Container>
          <div className="contact-layout">

            {/* Info column */}
            <div className="contact-info">
              <h2>Let&rsquo;s talk</h2>
              <p>
                Whether you&rsquo;re evaluating SmithForgd for your team, have a feature request,
                or need enterprise pricing — we respond to every message.
              </p>
              <ul className="contact-info__list">
                {CONTACT_ITEMS.map(({ Icon, label, value, accent }) => (
                  <li key={label} className="contact-info__item">
                    <div className={`contact-info__item-icon contact-info__item-icon--${accent}`}>
                      <Icon />
                    </div>
                    <div>
                      <div className="contact-info__item-label">{label}</div>
                      <div className="contact-info__item-value">{value}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form card */}
            <Card className="contact-form-card">
              <h3>Send a message</h3>

              {status === 'error' && (
                <div className="contact-form-card__error" role="alert">
                  Something went wrong. Please try again.
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form" noValidate>
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label htmlFor="contact-firstName" className="contact-form__label contact-form__label--required">
                      First name
                    </label>
                    <input
                      id="contact-firstName"
                      type="text"
                      className={`contact-form__input${errors.firstName ? ' contact-form__input--error' : ''}`}
                      value={form.firstName}
                      onChange={change('firstName')}
                      placeholder="Alex"
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <span className="contact-form__error-msg">{errors.firstName}</span>
                    )}
                  </div>
                  <div className="contact-form__field">
                    <label htmlFor="contact-lastName" className="contact-form__label contact-form__label--required">
                      Last name
                    </label>
                    <input
                      id="contact-lastName"
                      type="text"
                      className={`contact-form__input${errors.lastName ? ' contact-form__input--error' : ''}`}
                      value={form.lastName}
                      onChange={change('lastName')}
                      placeholder="Morgan"
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <span className="contact-form__error-msg">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-email" className="contact-form__label contact-form__label--required">
                    Work email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    className={`contact-form__input${errors.email ? ' contact-form__input--error' : ''}`}
                    value={form.email}
                    onChange={change('email')}
                    placeholder="alex@company.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <span className="contact-form__error-msg">{errors.email}</span>
                  )}
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-company" className="contact-form__label">
                    Company <span className="contact-form__optional">(optional)</span>
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    className="contact-form__input"
                    value={form.company}
                    onChange={change('company')}
                    placeholder="Acme Services LLC"
                    autoComplete="organization"
                  />
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-subject" className="contact-form__label">Subject</label>
                  <select
                    id="contact-subject"
                    className="contact-form__input"
                    value={form.subject}
                    onChange={change('subject')}
                  >
                    <option value="">Select a topic…</option>
                    <option value="sales">Sales &amp; Pricing</option>
                    <option value="support">Technical Support</option>
                    <option value="enterprise">Enterprise Inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="contact-form__field">
                  <label htmlFor="contact-message" className="contact-form__label contact-form__label--required">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    className={`contact-form__input contact-form__textarea${errors.message ? ' contact-form__input--error' : ''}`}
                    value={form.message}
                    onChange={change('message')}
                    placeholder="Tell us what you're working on…"
                    rows={5}
                  />
                  {errors.message && (
                    <span className="contact-form__error-msg">{errors.message}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={status === 'submitting'}
                  className="contact-form__submit"
                >
                  {status === 'submitting' ? (
                    <span className="contact-form__spinner" aria-hidden="true" />
                  ) : null}
                  {status === 'submitting' ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            </Card>

          </div>
        </Container>
      </section>
    </div>
  )
}
