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

const CONTACT_ITEMS = [
  { icon: '📧', label: 'Email us',       value: 'hello@smithforgd.com'         },
  { icon: '📍', label: 'Headquartered',  value: 'Tallahassee, FL · Valdosta, GA' },
  { icon: '🕐', label: 'Response time',  value: 'Within 1 business day'         },
  { icon: '🛠️', label: 'Support hours',  value: 'Mon – Fri, 9am – 6pm ET'       },
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
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.lastName.trim())  e.lastName  = 'Required'
    if (!form.email.includes('@')) e.email  = 'Enter a valid email'
    if (!form.message.trim())   e.message   = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setStatus('submitting')
    // Simulate network — wire to POST /api/v1/contact when available
    await new Promise((r) => setTimeout(r, 1100))
    console.log('[Contact form submitted]', form)
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <main className="contact-page">
        <section className="contact-hero">
          <Container>
            <div className="contact-hero__eyebrow">Contact</div>
            <h1 className="contact-hero__title">Contact us</h1>
          </Container>
        </section>
        <section className="contact-body">
          <Container>
            <div className="contact-success">
              <div className="contact-success__icon" aria-hidden="true">✓</div>
              <h2>Message sent!</h2>
              <p>Thanks for reaching out. We&rsquo;ll get back to you within one business day.</p>
              <Button
                variant="primary"
                onClick={() => { setForm(EMPTY); setStatus('idle') }}
              >
                Send another message
              </Button>
            </div>
          </Container>
        </section>
      </main>
    )
  }

  return (
    <main className="contact-page">
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
                {CONTACT_ITEMS.map((item) => (
                  <li key={item.label} className="contact-info__item">
                    <span className="contact-info__item-icon" aria-hidden="true">{item.icon}</span>
                    <div>
                      <div className="contact-info__item-label">{item.label}</div>
                      <div className="contact-info__item-value">{item.value}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form column */}
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
                    <label className="contact-form__label contact-form__label--required">
                      First name
                    </label>
                    <input
                      type="text"
                      className={`contact-form__input${errors.firstName ? ' contact-form__input--error' : ''}`}
                      value={form.firstName}
                      onChange={change('firstName')}
                      placeholder="Alex"
                      autoComplete="given-name"
                    />
                    {errors.firstName && <span className="contact-form__error-msg">{errors.firstName}</span>}
                  </div>
                  <div className="contact-form__field">
                    <label className="contact-form__label contact-form__label--required">
                      Last name
                    </label>
                    <input
                      type="text"
                      className={`contact-form__input${errors.lastName ? ' contact-form__input--error' : ''}`}
                      value={form.lastName}
                      onChange={change('lastName')}
                      placeholder="Morgan"
                      autoComplete="family-name"
                    />
                    {errors.lastName && <span className="contact-form__error-msg">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="contact-form__field">
                  <label className="contact-form__label contact-form__label--required">
                    Work email
                  </label>
                  <input
                    type="email"
                    className={`contact-form__input${errors.email ? ' contact-form__input--error' : ''}`}
                    value={form.email}
                    onChange={change('email')}
                    placeholder="alex@company.com"
                    autoComplete="email"
                  />
                  {errors.email && <span className="contact-form__error-msg">{errors.email}</span>}
                </div>

                <div className="contact-form__field">
                  <label className="contact-form__label">Company <span className="contact-form__optional">(optional)</span></label>
                  <input
                    type="text"
                    className="contact-form__input"
                    value={form.company}
                    onChange={change('company')}
                    placeholder="Acme Services LLC"
                    autoComplete="organization"
                  />
                </div>

                <div className="contact-form__field">
                  <label className="contact-form__label">Subject</label>
                  <select
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
                  <label className="contact-form__label contact-form__label--required">Message</label>
                  <textarea
                    className={`contact-form__input contact-form__textarea${errors.message ? ' contact-form__input--error' : ''}`}
                    value={form.message}
                    onChange={change('message')}
                    placeholder="Tell us what you're working on…"
                    rows={5}
                  />
                  {errors.message && <span className="contact-form__error-msg">{errors.message}</span>}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={status === 'submitting'}
                  className="contact-form__submit"
                >
                  {status === 'submitting' ? 'Sending…' : 'Send message'}
                </Button>
              </form>
            </Card>
          </div>
        </Container>
      </section>
    </main>
  )
}
