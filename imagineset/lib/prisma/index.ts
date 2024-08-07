import { PrismaClient } from '@prisma/client'
import singleton from '../singleton'

export default singleton('prisma', () => {
  //   if (process.env.NODE_ENV === 'development') {
  //     const prisma = new PrismaClient({
  //       log: [
  //         {
  //           emit: 'event',
  //           level: 'query',
  //         },
  //       ],
  //     })
  //     prisma.$on('query', async (e) => {
  //         console.log(`${e.query} ${e.params}`)
  //     })
  //     return prisma
  //   }
  const prisma = new PrismaClient()
    prisma.$use(async (params, next) => {
      if (params.action == "create" && params.model == "Account") {
        delete params.args.data["refresh_expires_in"]
        delete params.args.data["not-before-policy"]
      }
      const result = await next(params)
      return result
    })
    return prisma
  })