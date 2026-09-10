'use client';

import { useActionState } from 'react';
import { createWorkspaceAction } from '../actions/workspace';

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createWorkspaceAction, null);

  return (
    <form action={formAction}>
      {state?.error && <div className="auth-error show">{state.error}</div>}

      <div className="field">
        <div className="field-label-row">
          <label htmlFor="workspace">Workspace Name</label>
        </div>
        <input
          type="text"
          id="workspace"
          name="workspace"
          required
          placeholder="e.g. Acme Corp"
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '8px', justifyContent: 'center' }}
        disabled={pending}
      >
        {pending ? 'Creating...' : 'Create Workspace'}
      </button>
    </form>
  );
}
