import { NextRequest, NextResponse } from 'next/server'
import { financeServices } from '../../../lib/services/container'

export async function GET() {
  try {
    const account = financeServices.stellar.getAccountInfo()
    const offRampMethods = financeServices.stellar.getOffRampMethods()
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        account, 
        offRampMethods 
      } 
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'validateAddress':
        const isValid = financeServices.stellar.validateAddress(data.address)
        return NextResponse.json({ success: true, data: { isValid } })
      
      case 'generateAddress':
        const address = financeServices.stellar.generateReceiveAddress()
        return NextResponse.json({ success: true, data: { address } })
      
      case 'getOffRampRate':
        const rate = financeServices.stellar.getOffRampRate(data.currency)
        return NextResponse.json({ success: true, data: { currency: data.currency, rate } })
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Invalid request' },
      { status: 400 }
    )
  }
}