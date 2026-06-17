import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SendForm } from '../../components/app/send-form'
import { FinanceServicesProvider } from '../../hooks/useFinanceServices'
import { FinanceServiceContainer } from '../../lib/services/container'

describe('SendFlow Integration', () => {
    it('should complete a full send flow and verify via API', async () => {
        // This is a simplified integration test that mocks the API response
        // In a real environment, this might use MSW to intercept actual fetch calls

        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true, hash: '0xhash123', status: 'completed' })
        })

        render(
            <FinanceServicesProvider>
                <SendForm />
            </FinanceServicesProvider>
        )

        // Simulate user interaction
        fireEvent.change(screen.getByLabelText(/Recipient Address/i), { target: { value: 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX' } })
        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '10' } })

        const sendButton = screen.getByRole('button', { name: /Confirm Send/i })
        fireEvent.click(sendButton)

        // Verify success state in UI
        await waitFor(() => {
            expect(screen.getByText(/Transaction Successful/i)).toBeInTheDocument()
        })

        // Verify API was called for verification (mocked)
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/wallet/send'), expect.any(Object))
    })
})
