import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SendForm } from '../../../components/app/send-form'
import { FinanceServicesProvider } from '../../../hooks/useFinanceServices'
import { FinanceServiceContainer } from '../../../lib/services/container'

// Mock services
const mockWallet = {
    sendPayment: jest.fn().mockResolvedValue({ status: 'completed', hash: '123' }),
    validateAddress: jest.fn().mockReturnValue(true),
    getAccountInfo: jest.fn().mockReturnValue({ publicKey: 'abc' }),
    getBalance: jest.fn().mockResolvedValue([])
}

const mockContainer = new FinanceServiceContainer(mockWallet as any)

describe('SendForm Component', () => {
    it('should render correctly', () => {
        render(
            <FinanceServicesProvider services={mockContainer}>
                <SendForm />
            </FinanceServicesProvider>
        )
        expect(screen.getByText(/Send Money/i)).toBeInTheDocument()
    })

    it('should show error for invalid address', async () => {
        mockWallet.validateAddress.mockReturnValueOnce(false)

        render(
            <FinanceServicesProvider services={mockContainer}>
                <SendForm />
            </FinanceServicesProvider>
        )

        const input = screen.getByLabelText(/Recipient Address/i)
        fireEvent.change(input, { target: { value: 'invalid' } })

        const button = screen.getByRole('button', { name: /Send/i })
        fireEvent.click(button)

        await waitFor(() => {
            expect(screen.getByText(/Invalid address/i)).toBeInTheDocument()
        })
    })

    it('should call sendPayment on valid submit', async () => {
        render(
            <FinanceServicesProvider services={mockContainer}>
                <SendForm />
            </FinanceServicesProvider>
        )

        fireEvent.change(screen.getByLabelText(/Recipient Address/i), { target: { value: 'G...' } })
        fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } })

        fireEvent.click(screen.getByRole('button', { name: /Send/i }))

        await waitFor(() => {
            expect(mockWallet.sendPayment).toHaveBeenCalledWith(expect.any(String), 100, 'XLM')
        })
    })
})
