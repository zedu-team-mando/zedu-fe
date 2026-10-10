# FE preview image. The build job assembles the context from a `next build` standalone output:
#   ./                          .next/standalone
#   ./.next/static              .next/static
#   ./public                    public
#   ./public/mainapp/_next/static  .next/static again: production builds request assets under
#                                  the /mainapp prefix (next.config assetPrefix), served here as
#                                  plain public files so no proxy rule is needed.
# The official node image from AWS's public mirror: anonymous Docker Hub pulls from shared GitHub
# runners hit Docker Hub's rate limit (429 Too Many Requests) and fail the preview build.
FROM public.ecr.aws/docker/library/node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
COPY --chown=node:node . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]
