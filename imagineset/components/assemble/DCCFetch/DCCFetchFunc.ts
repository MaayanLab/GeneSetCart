'use server'

import prisma from "@/lib/prisma"

export const termSearch = async (term: string) => {
    const termString = term.replace(' ', ' & ')
    try {
        const result = await prisma.cfdegeneset.findMany({
            where: {
              term: {
                search: termString,
              },
            },
            include: 
            {
                genes: true
            }
          })
          return result
    } catch (err) {
        try {
            const result = await prisma.cfdegeneset.findMany({
                where: {
                  term: {
                    search: term,
                  },
                },
                include: 
                {
                    genes: true
                }
              })
              return result
        } catch {
            return []
        }
    }
}