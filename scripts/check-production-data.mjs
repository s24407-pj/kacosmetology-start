import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true },
  resolve: { tsconfigPaths: true },
  logLevel: 'silent',
})

try {
  const [
    { services },
    { promotionConfigs },
    { getServicePriceHistory },
    validator,
    { specializations },
  ] = await Promise.all([
    server.ssrLoadModule('/src/data/services.ts'),
    server.ssrLoadModule('/src/data/promotion.ts'),
    server.ssrLoadModule('/src/data/servicePriceHistory.ts'),
    server.ssrLoadModule('/src/data/serviceValidation.ts'),
    server.ssrLoadModule('/src/data/specializations.ts'),
  ])
  const errors = validator.validateServices({
    services,
    promotions: promotionConfigs,
    getPriceHistory: getServicePriceHistory,
    specializations,
  })
  if (errors.length > 0) throw new Error(errors.join('\n'))
} finally {
  await server.close()
}
