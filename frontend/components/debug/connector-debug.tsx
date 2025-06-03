"use client"

import { useConfig, useConnectors, useConnect } from 'wagmi'
import { useEffect, useState } from 'react'

export function ConnectorDebug() {
  const config = useConfig()
  const connectors = useConnectors()
  const { connect, status, error } = useConnect()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      console.log('🔍 ConnectorDebug mounted - Available connectors:', connectors.map(connector => ({
        id: connector.id,
        name: connector.name,
        type: connector.type,
        ready: connector.ready,
        uid: connector.uid
      })))
    }
  }, [connectors, mounted])

  useEffect(() => {
    if (mounted) {
      console.log('🔍 useConnect status:', { status, error: error?.message })
    }
  }, [status, error, mounted])
  
  if (process.env.NODE_ENV !== 'development' || !mounted) {
    return null
  }
  
  return (
    <div className="fixed bottom-4 left-4 bg-black text-white p-3 text-xs max-w-sm rounded border z-50">
      <div className="font-bold mb-2">🔍 Connector Debug</div>
      <div className="space-y-1">
        <div>Total Connectors: {connectors.length}</div>
        <div>Connect Status: {status}</div>
        {error && <div className="text-red-300">Error: {error.message}</div>}
        
        <div className="mt-2">
          <div className="font-semibold">Available Connectors:</div>
          {connectors.length === 0 ? (
            <div className="text-yellow-300">⚠️ No connectors found!</div>
          ) : (
            connectors.map(connector => (
              <div key={connector.id} className="ml-2">
                <div>{connector.name} ({connector.id})</div>
                <div className="text-xs text-gray-300">
                  Type: {connector.type} | Ready: {connector.ready ? '✅' : '❌'}
                </div>
                <button 
                  onClick={() => connect({ connector })}
                  disabled={status === 'pending'}
                  className="text-xs bg-blue-600 px-2 py-1 rounded mt-1 hover:bg-blue-700 disabled:bg-gray-600"
                >
                  {status === 'pending' ? 'Connecting...' : 'Test Connect'}
                </button>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-2 text-xs text-gray-400">
          Check console for detailed logs
        </div>
      </div>
    </div>
  )
} 