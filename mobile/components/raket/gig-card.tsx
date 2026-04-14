import { StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { durationBucketLabels, formatCurrency, gigCategoryLabels, type PublicGig } from '@/lib/api';

import { Pill } from './pill';

export function GigCard({ gig }: { gig: PublicGig }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          shadowColor: colorScheme === 'light' ? palette.shadow : palette.text,
        },
      ]}>
      <View style={styles.headerRow}>
        <Pill label={gigCategoryLabels[gig.category]} tone="accent" />
        <Text style={[styles.price, { color: palette.text }]}>
          {formatCurrency(gig.priceAmount, gig.currency)}
        </Text>
      </View>

      <Text style={[styles.title, { color: palette.text }]}>{gig.title}</Text>
      <Text style={[styles.description, { color: palette.muted }]} numberOfLines={3}>
        {gig.description}
      </Text>

      <View style={styles.metaGrid}>
        <Text style={[styles.metaLabel, { color: palette.muted }]}>
          {gig.location.barangay}, {gig.location.city}
        </Text>
        <Text style={[styles.metaLabel, { color: palette.muted }]}>
          {durationBucketLabels[gig.durationBucket]}
        </Text>
        <Text style={[styles.metaLabel, { color: palette.muted }]}>{gig.scheduleSummary}</Text>
        <Text style={[styles.metaLabel, { color: palette.muted }]}>
          {gig.distanceKm == null ? `${gig.applicationRadiusKm} km radius` : `${gig.distanceKm} km away`}
        </Text>
      </View>

      <View style={[styles.footerRow, { borderTopColor: palette.border }]}>
        <View>
          <Text style={[styles.posterName, { color: palette.text }]}>{gig.poster.displayName}</Text>
          <Text style={[styles.posterMeta, { color: palette.muted }]}>
            {gig.poster.jobsCompleted} jobs completed
          </Text>
        </View>
        <View style={styles.posterStats}>
          <Text style={[styles.rating, { color: palette.text }]}>{gig.poster.rating.toFixed(1)}</Text>
          <Text style={[styles.posterMeta, { color: palette.muted }]}>
            {gig.poster.reviewCount} reviews
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 2,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    lineHeight: 28,
  },
  price: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaGrid: {
    gap: 6,
  },
  metaLabel: {
    fontFamily: Fonts.rounded,
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  posterName: {
    fontSize: 15,
    fontWeight: '700',
  },
  posterMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  posterStats: {
    alignItems: 'flex-end',
  },
  rating: {
    fontFamily: Fonts.rounded,
    fontSize: 18,
    fontWeight: '800',
  },
});
