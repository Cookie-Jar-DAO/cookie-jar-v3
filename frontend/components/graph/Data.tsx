'use client'

import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Define types for the GraphQL response
interface CookieJar {
  id: string
  creator: string
  cookieJarAddress: string
  metadata: string
}

interface CookieJarData {
  cookieJarCreateds: CookieJar[]
}

interface WhitelistData {
  whitelistUpdateds: {
    users: string[]
  }[]
}

const cookieJarQuery = gql`{
  cookieJarCreateds(first: 5) {
    id
    creator
    cookieJarAddress
    metadata
  }
}`

const whitelistQuery = gql`
  query GetWhitelist($contractAddress: String!) {
    whitelistUpdateds(where: {contractAddress: $contractAddress}) {
      users
    }
  }
`

const url = 'https://api.studio.thegraph.com/query/84825/cookie-jar/version/latest'
const headers = { Authorization: 'Bearer {api-key}' }

export default function CookieJarData() {
  const [selectedJar, setSelectedJar] = useState<string | null>(null)

  const { data: jarsData, isLoading: isJarsLoading, isError: isJarsError } = useQuery<CookieJarData>({
    queryKey: ['cookieJarData'],
    queryFn: async () => {
      return await request(url, cookieJarQuery, {}, headers)
    }
  })

  const { data: whitelistData, isLoading: isWhitelistLoading } = useQuery<WhitelistData>({
    queryKey: ['whitelistData', selectedJar],
    queryFn: async () => {
      console.log("hitt");

      if (!selectedJar) return { whitelistUpdateds: [] }
      console.log("hitt");
      return await request(
        url, 
        whitelistQuery, 
        { contractAddress: selectedJar },
        headers
      )
    },
    enabled: !!selectedJar
  })
 
  if (isJarsLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Cookie Jar Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isJarsError) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto">
        <AlertDescription>
          Failed to load cookie jar data. Please check your API key and try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (!jarsData || !jarsData.cookieJarCreateds?.length) {
    return (
      <Alert className="max-w-4xl mx-auto">
        <AlertDescription>
          No cookie jar data found.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Cookie Jar Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium">Select Cookie Jar to View Whitelist</p>
          <Select onValueChange={(value) => setSelectedJar(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Cookie Jar" />
            </SelectTrigger>
            <SelectContent>
              {jarsData.cookieJarCreateds.map((jar) => (
                <SelectItem key={jar.cookieJarAddress} value={jar.cookieJarAddress}>
                  {jar.id.substring(0, 8)}... ({jar.cookieJarAddress.substring(0, 6)}...)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedJar && (
          <div className="mt-4 border rounded-md p-4">
            <h3 className="text-lg font-medium mb-2">Whitelist</h3>
            {isWhitelistLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : whitelistData?.whitelistUpdateds?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No whitelist data found for this Cookie Jar.</p>
            ) : (
              <div className="space-y-2">
                {whitelistData?.whitelistUpdateds?.map((whitelist, index) => (
                  <div key={index} className="border rounded-md p-2">
                    <p className="text-sm font-medium mb-2">Whitelisted Users:</p>
                    <div className="grid gap-2">
                      {whitelist.users?.length > 0 ? (
                        whitelist.users.map((user, i) => (
                          <div key={i} className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                            <p className="font-mono text-sm break-all">{user}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No users in this whitelist.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="w-full mt-6">
          {jarsData.cookieJarCreateds.map((jar) => (
            <AccordionItem key={jar.id} value={jar.id}>
              <AccordionTrigger>
                <div className="flex items-center space-x-2">
                  <span>Cookie Jar</span>
                  <Badge variant="outline">{jar.id.substring(0, 8)}...</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-4 p-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">ID</p>
                    <p className="font-mono text-sm break-all">{jar.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Creator</p>
                    <p className="font-mono text-sm break-all">{jar.creator}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Cookie Jar Address</p>
                    <p className="font-mono text-sm break-all">{jar.cookieJarAddress}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Metadata</p>
                    <p className="font-mono text-sm break-all">{jar.metadata || 'No metadata'}</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}