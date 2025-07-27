'use server'
import {revalidatePath} from 'next/cache'
import {RateLimiterMemory} from 'rate-limiter-flexible'

import {
  incrementViewPostService,
  likePostService,
} from '@/services/facades/post-service-facade'

const rateLikeLimiter = new RateLimiterMemory({
  points: 5, // 1 point
  duration: 60, // per 60 seconds
})

const rateViewLimiter = new RateLimiterMemory({
  points: 5, // 1 point
  duration: 60, // per 60 seconds
})

export async function incrementLikePostById(postId: string) {
  try {
    await rateLikeLimiter.consume(postId) // consume 1 point per id
    await likePostService(postId)
    revalidatePath('/blog/[slug]', 'page')
    return {
      success: true,
    }
  } catch (error) {
    console.error('Erreur lors du like:', error)
    if (isRateLimiterRes(error)) {
      return {
        success: false,
        message: 'Too many requests, please try again later.',
      }
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

export async function incrementViewPostById(postId: string) {
  try {
    await rateViewLimiter.consume(postId) // consume 1 point per id
    await incrementViewPostService(postId)
    revalidatePath('/blog/[slug]', 'page')

    return {
      success: true,
    }
  } catch (error) {
    if (isRateLimiterRes(error)) {
      return {
        success: false,
        message: 'Too many requests, please try again later.',
      }
    }
    console.error("Erreur lors de l'ajout de vue:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    }
  }
}

function isRateLimiterRes(error: unknown) {
  return (
    error &&
    typeof error === 'object' &&
    'remainingPoints' in error &&
    'msBeforeNext' in error
  )
}
