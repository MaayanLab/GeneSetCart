"use server"
import prisma from '@/lib/prisma'

export async function getCachedResult(inputHash: string) {
    const existingReport = await prisma.report.findFirst({
        where: {
            hash: inputHash
        }
    })
    return existingReport
}

export async function cacheResult(inputHash: string, analysisResults: any) {
    const added = await prisma.report.create({
        data: {
            hash: inputHash,
            analysisData: JSON.stringify(analysisResults)
        }
    })
    return 'added'
}
