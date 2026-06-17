import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SendForm } from '../../components/app/send-form'
import { FinanceServicesProvider } from '../../hooks/useFinanceServices'
import { FinanceServiceContainer } from '../../lib/services/container'
import * as React from 'react'

describe('SendForm Component', () => {
    let mockWallet: any
    let mockPricing: any
    let mockFiat: any
    let mockContainer: any

    beforeEach(() => {
        mockWallet = {
            sendPayment: jest.fn().mockResolvedValue({ success: true, hash: '0xhash123', status: 'completed' }),
            validateAddress: jest.fn().mockReturnValue(true),
            getAccountInfo: jest.fn().mockReturnValue({ publicKey: 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX', network: 'Stellar Public Network' }),
            getBalance: jest.fn().mockResolvedValue([])
        }

        mockPricing = {
            getAssets: jest.fn().mockReturnValue([
                { code: 'XLM', name: 'Stellar Lumens', balance: 500, priceUsd: 0.12, change24h: 1.5, color: 'bg-primary' }
            ]),
            getPrice: jest.fn().mockResolvedValue(0.12),
            formatAsset: jest.fn().mockImplementation((amount, code) => `${amount} ${code}`)
        }

        mockFiat = {
            getWallets: jest.fn().mockReturnValue([]),
            formatMoney: jest.fn().mockImplementation((amount, currency) => `$${amount}`),
            convertCurrency: jest.fn().mockReturnValue(0),
            getAccountBalance: jest.fn().mockReturnValue(0)
        }

        mockContainer = {
            wallet: mockWallet,
            pricing: mockPricing,
            fiat: mockFiat,
            exchange: {},
            offRamp: {},
            soroban: {}
        }
    })

    it('should render form elements with proper aria labels and test IDs', () => {
        render(
            <FinanceServicesProvider services={mockContainer as any}>
                <SendForm />
            </FinanceServicesProvider>
        )

        expect(screen.getByRole('form', { name: /Send payment form/i })).toBeInTheDocument()
        expect(screen.getByTestId('address-input')).toBeInTheDocument()
        expect(screen.getByTestId('amount-input')).toBeInTheDocument()
        expect(screen.getByTestId('memo-input')).toBeInTheDocument()
        expect(screen.getByTestId('send-submit-btn')).toBeInTheDocument()
    })

    it('should show client-side validation error for invalid stellar address', async () => {
        render(
            <FinanceServicesProvider services={mockContainer as any}>
                <SendForm />
            </FinanceServicesProvider>
        )

        const addressInput = screen.getByTestId('address-input')
        fireEvent.change(addressInput, { target: { value: 'invalid-address' } })

        const submitBtn = screen.getByTestId('send-submit-btn')
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(screen.getByTestId('send-error')).toBeInTheDocument()
            expect(screen.getByText(/Invalid Stellar address/i)).toBeInTheDocument()
        })

        // Check accessibility: aria-invalid set to true
        expect(addressInput).toHaveAttribute('aria-invalid', 'true')
    })

    it('should call sendPayment when inputs are valid', async () => {
        render(
            <FinanceServicesProvider services={mockContainer as any}>
                <SendForm />
            </FinanceServicesProvider>
        )

        const validAddr = 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX'
        fireEvent.change(screen.getByTestId('address-input'), { target: { value: validAddr } })
        fireEvent.change(screen.getByTestId('amount-input'), { target: { value: '150' } })
        fireEvent.change(screen.getByTestId('memo-input'), { target: { value: 'Testing memo' } })

        const submitBtn = screen.getByTestId('send-submit-btn')
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(mockWallet.sendPayment).toHaveBeenCalledWith(validAddr, 150, 'XLM', 'Testing memo')
            expect(screen.getByTestId('send-success')).toBeInTheDocument()
        })
    })

    it('should allow user to reset the form after success or error', async () => {
        render(
            <FinanceServicesProvider services={mockContainer as any}>
                <SendForm />
            </FinanceServicesProvider>
        )

        const validAddr = 'GDXSPAYWALLET7QK3MUKXHV2RZ4D6FJ5N2YHV3K2L9P8QW1ZC4T6BNRX'
        const addressInput = screen.getByTestId('address-input')
        const amountInput = screen.getByTestId('amount-input')

        fireEvent.change(addressInput, { target: { value: validAddr } })
        fireEvent.change(amountInput, { target: { value: '50' } })

        fireEvent.click(screen.getByTestId('send-submit-btn'))

        await waitFor(() => {
            expect(screen.getByTestId('send-success')).toBeInTheDocument()
        })

        // Click send another
        fireEvent.click(screen.getByTestId('send-again-btn'))

        expect(addressInput).toHaveValue('')
        expect(amountInput).toHaveValue(null)
    })
})
