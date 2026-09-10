import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewApiModal, NewApiButton } from '../app/components/modals/NewApiModal';
import '@testing-library/jest-dom';

describe('NewApiModal', () => {
  it('opens and closes the modal via the NewApiButton', () => {
    render(<NewApiButton />);

    // Modal is initially closed (not in document)
    expect(screen.queryByTestId('new-api-form')).not.toBeInTheDocument();

    // Click to open
    const button = screen.getByText('+ New API');
    fireEvent.click(button);

    // Modal should be visible now
    expect(screen.getByTestId('new-api-form')).toBeInTheDocument();

    // Click Cancel to close
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    // In our component, we don't physically remove it from the DOM when closing in a strict sense without checking the 'open' prop
    // But if open=false it returns null
    expect(screen.queryByTestId('new-api-form')).not.toBeInTheDocument();
  });

  it('progresses from Step 1 (form) to Step 2 (success) upon submission', async () => {
    render(<NewApiModal open={true} onClose={() => {}} />);

    // Ensure Step 1 is present
    expect(screen.getByTestId('new-api-form')).toBeInTheDocument();
    expect(screen.queryByTestId('new-api-success')).not.toBeInTheDocument();

    // Enter API name
    const input = screen.getByTestId('api-name-input');
    fireEvent.change(input, { target: { value: 'Test API' } });

    // Submit form
    const createBtn = screen.getByTestId('create-api-btn');
    fireEvent.click(createBtn);

    // Wait for the mock network delay (400ms) to finish and step 2 to appear
    await waitFor(
      () => {
        expect(screen.queryByTestId('new-api-form')).not.toBeInTheDocument();
        expect(screen.getByTestId('new-api-success')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Verify the API name is shown in success screen
    expect(screen.getByText('Test API')).toBeInTheDocument();
  });
});
