import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { productApi } from '../../services/products';

export function EnquiryPage() {
  const { id } = useParams();
  const productId = Number(id);
  const product = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productApi.byId(productId),
    enabled: productId > 0
  });
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [busy, setBusy] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    const phone = form.phone.trim();
    if (phone.length < 7 || phone.length > 20 || !/^\+?[0-9\s().-]+$/.test(phone) || (phone.match(/[0-9]/g)?.length ?? 0) < 7) {
      setPhoneError('Enter a phone number with at least 7 digits, using numbers and common phone punctuation.');
      return;
    }

    setPhoneError('');
    setBusy(true);
    setStatus('idle');
    try {
      await productApi.submitEnquiry({ ...form, phone, productId });
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setBusy(false);
    }
  }

  if (product.isLoading) return <main><p>Loading...</p></main>;
  if (product.isError || !product.data) return <main><p role="alert">Product not found.</p></main>;
  if (status === 'success') {
    return (
      <main className="success" role="status" aria-live="polite">
        <div className="success-icon">✓</div>
        <h1>Thank you!</h1>
        <p>Your enquiry for {product.data.title} has been submitted.</p>
        <Link to="/">Back to ShopSense</Link>
      </main>
    );
  }

  return (
    <main className="form-page">
      <p className="eyebrow">PRODUCT ENQUIRY</p>
      <h1>Let's talk about it.</h1>
      <p className="muted">Enquiring about: <strong>{product.data.title}</strong></p>
      <form className="enquiry-form" onSubmit={submit}>
        <label>
          Full name
          <input required autoComplete="name" minLength={2} maxLength={100} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          Email address
          <input required type="email" autoComplete="email" maxLength={254} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label>
          Phone number
          <input
            required
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? 'phone-error' : undefined}
            minLength={7}
            maxLength={20}
            value={form.phone}
            onChange={(event) => {
              setPhoneError('');
              setForm({ ...form, phone: event.target.value });
            }}
          />
          {phoneError && <span id="phone-error" role="alert">{phoneError}</span>}
        </label>
        <label>
          Message
          <textarea required minLength={5} maxLength={2000} rows={4} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} />
        </label>
        {status === 'error' && <p role="alert">We couldn't submit your enquiry. Please try again.</p>}
        <button type="submit" className="primary" disabled={busy}>{busy ? 'Submitting...' : 'Submit enquiry'}</button>
      </form>
    </main>
  );
}
