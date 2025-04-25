'use client'

import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

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

const query = gql`{
  cookieJarCreateds(first: 5) {
    id
    creator
    cookieJarAddress
    metadata
  }
}` 

const url = 'https://api.studio.thegraph.com/query/84825/cookie-jar/version/latest'
const headers = { Authorization: 'Bearer {api-key}' }

export default function CookieJarData() {
  const { data, isLoading, isError } = useQuery<CookieJarData>({
    queryKey: ['cookieJarData'],
    queryFn: async () => {
      return await request(url, query, {}, headers)
    }
  })

  if (isLoading) {
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

  if (isError) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto">
        <AlertDescription>
          Failed to load cookie jar data. Please check your API key and try again.
        </AlertDescription>
      </Alert>
    )
  }

  if (!data || !data.cookieJarCreateds?.length) {
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
        <Accordion type="single" collapsible className="w-full">
          {data.cookieJarCreateds.map((jar) => (
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