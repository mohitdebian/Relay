'use client';

import { useState } from 'react';
import Modal from '../Modal';
import { Dropdown } from '../Dropdown';

interface AddWebhookModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddWebhookModal({ open, onClose }: AddWebhookModalProps) {
  const [url, setUrl] = useState('');
  const [event, setEvent] = useState('All Events');

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setUrl('');
      setEvent('All Events');
    }, 200);
  };

  const submitWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    // wire up to real webhook creation here
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Webhook">
      <form onSubmit={submitWebhook}>
        <div className="modal-body">
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
          <button type="button" className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Webhook
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
