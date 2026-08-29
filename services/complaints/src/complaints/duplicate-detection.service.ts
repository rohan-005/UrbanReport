import { Injectable } from '@nestjs/common';

export interface DuplicateCheckInput {
  latitude: number;
  longitude: number;
  category: string;
  title?: string;
  description?: string;
  radius?: number;
}

export type DuplicateConfidence = 'HIGH' | 'POSSIBLE' | 'LOW';

export interface DuplicateCandidateResult {
  complaintId: string;
  title: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  address: string;
  distanceMeters: number;
  similarityScore: number; // 0.0 to 1.0
  similarityPercentage: number; // 0 to 100
  confidence: DuplicateConfidence;
  createdAt: string;
  media?: any[];
}

@Injectable()
export class DuplicateDetectionService {
  /**
   * Scores and ranks nearby open complaint candidates based on Distance (40%), Category (25%), Text Similarity (25%), and Time Recency (10%).
   */
  rankCandidates(
    rawCandidates: any[],
    input: DuplicateCheckInput,
    maxRadiusMeters: number,
  ): DuplicateCandidateResult[] {
    if (!rawCandidates || rawCandidates.length === 0) return [];

    const inputCategory = (input.category || '').trim().toUpperCase();
    const inputText = `${input.title || ''} ${input.description || ''}`.trim().toLowerCase();
    const inputTokens = this.tokenize(inputText);

    const scored = rawCandidates.map((candidate) => {
      const distance = candidate.distance_meters !== undefined && candidate.distance_meters !== null
        ? Number(candidate.distance_meters)
        : this.calculateHaversineDistance(
            input.latitude,
            input.longitude,
            Number(candidate.latitude),
            Number(candidate.longitude),
          );

      // 1. Distance Score (40%)
      const distanceScore = Math.max(0, 1 - distance / maxRadiusMeters);

      // 2. Category Match Score (25%)
      const candidateCategory = (candidate.category || '').trim().toUpperCase();
      const categoryScore = candidateCategory === inputCategory ? 1.0 : 0.2;

      // 3. Text Similarity Score (25%)
      const candidateText = `${candidate.title || ''} ${candidate.description || ''}`.trim().toLowerCase();
      const candidateTokens = this.tokenize(candidateText);
      const textScore = this.jaccardSimilarity(inputTokens, candidateTokens);

      // 4. Time Recency Score (10%)
      const createdAtTime = new Date(candidate.created_at || candidate.createdAt || Date.now()).getTime();
      const daysOld = Math.max(0, (Date.now() - createdAtTime) / (1000 * 60 * 60 * 24));
      const timeScore = Math.max(0.1, Math.exp(-daysOld / 30)); // 30-day half-life decay

      // Composite Weighted Score
      const compositeScore =
        0.4 * distanceScore +
        0.25 * categoryScore +
        0.25 * textScore +
        0.1 * timeScore;

      const roundedScore = Math.min(1.0, Math.max(0.0, Number(compositeScore.toFixed(3))));
      const similarityPercentage = Math.round(roundedScore * 100);

      let confidence: DuplicateConfidence = 'LOW';
      if (roundedScore >= 0.65) {
        confidence = 'HIGH';
      } else if (roundedScore >= 0.42) {
        confidence = 'POSSIBLE';
      }

      return {
        complaintId: candidate.id,
        title: candidate.title,
        category: candidate.category,
        status: candidate.status,
        latitude: Number(candidate.latitude),
        longitude: Number(candidate.longitude),
        address: candidate.address,
        distanceMeters: Math.round(distance),
        similarityScore: roundedScore,
        similarityPercentage,
        confidence,
        createdAt: candidate.created_at || candidate.createdAt || new Date().toISOString(),
        media: candidate.media || [],
      };
    });

    // Filter out candidates with LOW confidence or score < 0.40 and sort descending by score
    return scored
      .filter((c) => c.confidence !== 'LOW' && c.similarityScore >= 0.40)
      .sort((a, b) => b.similarityScore - a.similarityScore);
  }

  private tokenize(text: string): Set<string> {
    if (!text) return new Set();
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2); // Ignore stop words / short tokens
    return new Set(words);
  }

  private jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 || setB.size === 0) return 0.2;
    let intersectionCount = 0;
    setA.forEach((token) => {
      if (setB.has(token)) intersectionCount++;
    });
    const unionSize = setA.size + setB.size - intersectionCount;
    return unionSize === 0 ? 0.2 : intersectionCount / unionSize;
  }

  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Earth radius in meters
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
