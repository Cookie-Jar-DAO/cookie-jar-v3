'use client'

import { useQuery } from '@tanstack/react-query'
import { gql, request } from 'graphql-request'
import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { useAccount } from 'wagmi'

// Define types for the GraphQL response
interface CookieJar {
  id: string
  creator: string
  cookieJarAddress: string
  metadata: string
  // Adding a timestamp field for sorting
  timestamp?: string
}

interface CookieJarData {
  cookieJarCreateds: CookieJar[]
}

// Updated query to include blockTimestamp for sorting

const url = 'https://api.studio.thegraph.com/query/84825/cookie-jar/version/latest'
const headers = { Authorization: 'Bearer {api-key}' }

export default function CookieJarData() {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const jarsPerPage = 4
  const { isConnected, address: userAddress } = useAccount()
  const query = gql`{
    cookieJarCreateds(first: 10, where: {creator: "${userAddress}"}) {
      id
      creator
      cookieJarAddress
      metadata
      blockTimestamp
    }
  }` 
  

  const { data, isLoading, isError } = useQuery<CookieJarData>({
    queryKey: ['cookieJarData'],
    queryFn: async () => {
      const response = await request(url, query, {}, headers);
      
      // Add fake timestamps if blockTimestamp is not available in the actual data
      // You can remove this if your API actually returns timestamps
      const jarsWithTimestamps = response.cookieJarCreateds.map((jar, index) => ({
        ...jar,
        timestamp: jar.blockTimestamp || new Date(Date.now() - index * 86400000).toISOString()
      }));
      
      return {
        cookieJarCreateds: jarsWithTimestamps
      };
    }
  })

  // Sort data by date
  const sortedJars = [...(data?.cookieJarCreateds || [])].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
    } else {
      return new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime();
    }
  });

  const totalPages = Math.ceil(sortedJars.length / jarsPerPage)
  const startIndex = (currentPage - 1) * jarsPerPage
  const paginatedJars = sortedJars.slice(startIndex, startIndex + jarsPerPage)

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown date';
    return new Date(Number(dateString) * 1000).toLocaleDateString();
  };
  

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Cookie Jar Data</h2>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
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
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cookie Jar Data</h2>
      </div>
      
      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paginatedJars.map((jar) => (
          <Card key={jar.id} className="border-[#f0e6d8] hover:border-[#ff5e14] transition-colors">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-medium">Cookie Jar</CardTitle>
                <Badge variant="outline" className="bg-[#fff7ec] text-[#ff5e14] border-[#f0e6d8]">
                  {jar.id.substring(0, 8)}...
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Creator</p>
                  <p className="font-mono text-sm break-all truncate" title={jar.creator}>
                    {jar.creator}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cookie Jar Address</p>
                  <p className="font-mono text-sm break-all truncate" title={jar.cookieJarAddress}>
                    {jar.cookieJarAddress}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Metadata</p>
                  <p className="font-mono text-sm break-all truncate" title={jar.metadata || 'No metadata'}>
                    {jar.metadata || 'No metadata'}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-[#f0e6d8]">
  <div className="flex items-center text-sm text-muted-foreground">
    <Calendar className="h-4 w-4 mr-1" />
{
  formatDate(jar.timestamp)
}  </div>
</CardFooter>

          </Card>
        ))}
      </div>
      
      {/* Pagination controls */}
      {sortedJars.length > jarsPerPage && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="border-[#f0e6d8] text-[#8b7355] hover:bg-[#fff7ec] hover:text-[#ff5e14]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
                className={
                  currentPage === i + 1
                    ? "bg-[#ff5e14] text-white hover:bg-[#e54d00]"
                    : "border-[#f0e6d8] text-[#8b7355] hover:bg-[#fff7ec] hover:text-[#ff5e14]"
                }
              >
                {i + 1}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="border-[#f0e6d8] text-[#8b7355] hover:bg-[#fff7ec] hover:text-[#ff5e14]"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}