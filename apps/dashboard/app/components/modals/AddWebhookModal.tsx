'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../Modal';
import { Dropdown } from '../Dropdown';
import { createWebhookAction } from '../../actions/webhooks';

interface AddWebhookModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddWebhookModal({ open, onClose }: AddWebhookModalProps) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [event, setEvent] = useState('All Events');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setUrl('');
      setEvent('All Events');
      setError('');
    }, 200);
  };

  const submitWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let events: string[] = [];
    if (event === 'All Events') events = ['*'];
    else if (event.includes('api.*')) events = ['api.*'];
    else if (event.includes('key.*')) events = ['key.*'];
    else events = [event];

    const res = await createWebhookAction(url, events);
    
    setLoading(false);
    
    if (res.success) {
      router.refresh();
      handleClose();
    } else {
      setError(res.error || 'Failed to create webhook');
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Webhook">
      <form onSubmit={submitWebhook}>
        <div className="modal-body">
          {error && <div className="c-red mb-4" style={{ color: 'var(--red)', marginBottom: '16px' }}>{error}</div>}
          <div className="field">
            <label>Payload URL</label>
            <input
              type="url"
              placeholder="https://example.com/webhook"
              required
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Events to send</label>
            <Dropdown
              value={event}
              onChange={setEvent}
              options={[
                { label: 'All Events', value: 'All Events' },
                { label: 'api.* (Any API event)', value: 'api.* (Any API event)' },
                { label: 'api.created', value: 'api.created' },
                { label: 'api.deleted', value: 'api.deleted' },
                { label: 'key.* (Any Key event)', value: 'key.* (Any Key event)' },
              ]}
            />
            <div className="hint">Which events would you like to trigger this webhook?</div>
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Webhook'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function AddWebhookButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        + Add webhook
      </button>
      <AddWebhookModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
