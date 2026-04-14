import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppConfig } from '@/components/app-config-provider';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  fetchMyGigs,
  fetchPublicGigs,
  formatCurrency,
  gigCategoryLabels,
  type GigCategory,
  type OwnedGig,
  type PublicGig,
} from '@/lib/api';

type HomeMode = 'find' | 'post';

const fallbackGigs: PublicGig[] = [
  {
    id: 'sample-1',
    title: 'Aircon cleaning for a two-bedroom unit',
    category: 'cleaning_home_help',
    description: 'Need someone experienced with split-type units for a same-day deep clean and checkup.',
    priceAmount: 1800,
    currency: 'PHP',
    durationBucket: 'same_day',
    status: 'published',
    applicationRadiusKm: 8,
    distanceKm: 2.2,
    scheduleSummary: 'Today, 1 PM',
    startsAt: null,
    endsAt: null,
    location: {
      city: 'Pasig',
      barangay: 'Kapitolyo',
      exactPinVisible: false,
    },
    poster: {
      id: 'poster-1',
      displayName: 'Casa Mila',
      rating: 4.8,
      reviewCount: 47,
      jobsCompleted: 18,
      responseRate: 95,
    },
    construction: null,
    createdAt: '2026-04-11T08:00:00.000Z',
  },
  {
    id: 'sample-2',
    title: 'House cleaning helper for move-out reset',
    category: 'cleaning_home_help',
    description: 'Need extra hands for sweeping, bathroom cleanup, window wiping, and bagging old items.',
    priceAmount: 1200,
    currency: 'PHP',
    durationBucket: 'same_day',
    status: 'published',
    applicationRadiusKm: 12,
    distanceKm: 4.1,
    scheduleSummary: 'Tomorrow, 8 AM',
    startsAt: null,
    endsAt: null,
    location: {
      city: 'Makati',
      barangay: 'Poblacion',
      exactPinVisible: false,
    },
    poster: {
      id: 'poster-2',
      displayName: 'Luna Residences',
      rating: 4.7,
      reviewCount: 59,
      jobsCompleted: 24,
      responseRate: 92,
    },
    construction: null,
    createdAt: '2026-04-11T07:15:00.000Z',
  },
  {
    id: 'sample-3',
    title: 'Moving helper for condo furniture transfer',
    category: 'moving_help',
    description: 'Looking for one strong helper to assist with carrying boxes, shelves, and a bed frame.',
    priceAmount: 1500,
    currency: 'PHP',
    durationBucket: 'same_day',
    status: 'published',
    applicationRadiusKm: 14,
    distanceKm: 5.7,
    scheduleSummary: 'Saturday, 10 AM',
    startsAt: null,
    endsAt: null,
    location: {
      city: 'Quezon City',
      barangay: "Teacher's Village East",
      exactPinVisible: false,
    },
    poster: {
      id: 'poster-3',
      displayName: 'Reyes Family',
      rating: 4.9,
      reviewCount: 33,
      jobsCompleted: 11,
      responseRate: 97,
    },
    construction: null,
    createdAt: '2026-04-10T19:30:00.000Z',
  },
  {
    id: 'sample-4',
    title: 'General helper for repaint and cleanup day',
    category: 'construction_helper',
    description: 'Need a helper for lifting paint pails, masking walls, cleanup, and basic site support.',
    priceAmount: 1300,
    currency: 'PHP',
    durationBucket: 'same_day',
    status: 'published',
    applicationRadiusKm: 8,
    distanceKm: 3.5,
    scheduleSummary: 'Sunday, 9 AM',
    startsAt: null,
    endsAt: null,
    location: {
      city: 'Taguig',
      barangay: 'Fort Bonifacio',
      exactPinVisible: false,
    },
    poster: {
      id: 'poster-4',
      displayName: 'BuildRight Crew',
      rating: 4.6,
      reviewCount: 40,
      jobsCompleted: 15,
      responseRate: 89,
    },
    construction: null,
    createdAt: '2026-04-10T18:30:00.000Z',
  },
];

const categories: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'snow-outline', label: 'Aircon Tech' },
  { icon: 'sparkles-outline', label: 'House Help' },
  { icon: 'hammer-outline', label: 'Painter Helper' },
  { icon: 'cube-outline', label: 'Moving' },
  { icon: 'walk-outline', label: 'Errand Runner' },
];

const homeModes: { key: HomeMode; label: string }[] = [
  { key: 'find', label: 'Find a job' },
  { key: 'post', label: 'Post a job' },
];

const postingChecklist = [
  'Name the job clearly so workers know exactly what they are taking.',
  'Add the schedule, budget, and exact area before you publish.',
  'Mention tools, supplies, or access notes to avoid back-and-forth later.',
];

const fallbackPosterGigs: OwnedGig[] = [
  {
    id: 'draft-1',
    title: 'Aircon cleaning for 2BR condo',
    category: 'cleaning_home_help',
    description: 'Draft job for condo aircon cleaning around Kapitolyo.',
    priceAmount: 1800,
    currency: 'PHP',
    durationBucket: 'same_day',
    status: 'draft',
    applicationRadiusKm: 8,
    distanceKm: null,
    scheduleSummary: 'Tomorrow, 1 PM',
    startsAt: null,
    endsAt: null,
    location: {
      city: 'Pasig',
      barangay: 'Kapitolyo',
      latitude: 14.5667,
      longitude: 121.0584,
      exactPinVisible: true,
    },
    construction: null,
    createdAt: '2026-04-11T08:00:00.000Z',
    updatedAt: '2026-04-11T08:00:00.000Z',
    applicationCount: 0,
  },
  {
    id: 'live-1',
    title: 'Weekend moving helper',
    category: 'moving_help',
    description: 'Need one helper for a condo move and box handling.',
    priceAmount: 1500,
    currency: 'PHP',
    durationBucket: 'same_day',
    status: 'published',
    applicationRadiusKm: 10,
    distanceKm: null,
    scheduleSummary: 'Saturday, 9 AM',
    startsAt: null,
    endsAt: null,
    location: {
      city: 'Quezon City',
      barangay: 'Teachers Village East',
      latitude: 14.6488,
      longitude: 121.0747,
      exactPinVisible: true,
    },
    construction: null,
    createdAt: '2026-04-10T09:00:00.000Z',
    updatedAt: '2026-04-10T09:00:00.000Z',
    applicationCount: 3,
  },
];

function getBrandMark(category: GigCategory, palette: (typeof Colors)['light']) {
  switch (category) {
    case 'cleaning_home_help':
      return { backgroundColor: palette.serviceCleaningSurface, icon: 'sparkles-outline' as const, iconColor: palette.accentStrong };
    case 'moving_help':
      return { backgroundColor: palette.serviceMovingSurface, icon: 'cube-outline' as const, iconColor: palette.serviceMovingTint };
    case 'construction_helper':
      return { backgroundColor: palette.serviceHelperSurface, icon: 'hammer-outline' as const, iconColor: palette.serviceHelperTint };
    case 'errands_personal_assistance':
      return { backgroundColor: palette.serviceErrandSurface, icon: 'walk-outline' as const, iconColor: palette.serviceErrandTint };
    default:
      return { backgroundColor: palette.serviceAirconSurface, icon: 'snow-outline' as const, iconColor: palette.serviceAirconTint };
  }
}

function formatPosterGigState(gig: OwnedGig): string {
  if (gig.status === 'draft') {
    return 'Draft';
  }

  if (gig.status === 'published' && gig.applicationCount > 0) {
    return 'Reviewing applicants';
  }

  if (gig.status === 'published') {
    return 'Live';
  }

  switch (gig.status) {
    case 'funded':
      return 'Funded';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'disputed':
      return 'Disputed';
    case 'cancelled':
      return 'Cancelled';
    case 'closed':
      return 'Closed';
    default:
      return gig.status;
  }
}

function buildPosterGigMeta(gig: OwnedGig): string {
  const statusLabel = formatPosterGigState(gig);
  const applicantLabel = gig.applicationCount === 1 ? '1 applicant' : `${gig.applicationCount} applicants`;

  return [
    statusLabel,
    gig.location.city,
    `${formatCurrency(gig.priceAmount)} per day`,
    gig.applicationCount > 0 ? applicantLabel : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

function SectionHeader({ title }: { title: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <Text
        selectable
        style={{
          color: palette.textStrong,
          fontFamily: Fonts.rounded,
          fontSize: 22,
          fontWeight: '800',
        }}>
        {title}
      </Text>
      <Pressable>
        <Text
          selectable
          style={{
            color: palette.accentStrong,
            fontFamily: Fonts.rounded,
            fontSize: 14,
            fontWeight: '700',
          }}>
          View All
        </Text>
      </Pressable>
    </View>
  );
}

function FeaturedJobCard({ gig }: { gig: PublicGig }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const mark = getBrandMark(gig.category, palette);

  return (
    <View
      style={{
        backgroundColor: palette.accent,
        borderRadius: 24,
        gap: 16,
        padding: 18,
        width: 250,
      }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: palette.surface,
              borderRadius: 999,
              height: 34,
              justifyContent: 'center',
              width: 34,
            }}>
            <Ionicons color={mark.iconColor} name={mark.icon} size={16} />
          </View>
          <Text
            selectable
            style={{
              color: palette.inverseText,
              fontFamily: Fonts.rounded,
              fontSize: 14,
              fontWeight: '700',
            }}>
            {gig.poster.displayName}
          </Text>
        </View>
        <Ionicons color={palette.inverseText} name="bookmark-outline" size={18} />
      </View>

      <View style={{ gap: 6, minHeight: 68 }}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          selectable
          style={{
            color: palette.inverseText,
            fontFamily: Fonts.rounded,
            fontSize: 24,
            fontWeight: '800',
            lineHeight: 28,
          }}>
          {gig.title}
        </Text>
        <Text
          numberOfLines={1}
          selectable
          style={{
            color: palette.inverseMuted,
            fontFamily: Fonts.sans,
            fontSize: 13,
          }}>
          {gig.location.city}, Philippines
        </Text>
      </View>

      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}>
        <Text
          selectable
          style={{
            color: palette.inverseText,
            fontFamily: Fonts.rounded,
            fontSize: 18,
            fontWeight: '800',
          }}>
          {formatCurrency(gig.priceAmount)}
          <Text style={{ fontSize: 13, fontWeight: '700' }}> per day</Text>
        </Text>
        <Text
          selectable
          style={{
            color: palette.inverseMuted,
            fontFamily: Fonts.rounded,
            fontSize: 12,
            fontWeight: '700',
          }}>
          {gigCategoryLabels[gig.category]}
        </Text>
      </View>
    </View>
  );
}

function RecommendedJobRow({ gig, isLast }: { gig: PublicGig; isLast: boolean }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const mark = getBrandMark(gig.category, palette);

  return (
    <Pressable
      style={{
        borderBottomColor: isLast ? 'transparent' : palette.borderSoft,
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: 14,
        padding: 16,
      }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: mark.backgroundColor,
          borderRadius: 14,
          height: 42,
          justifyContent: 'center',
          width: 42,
        }}>
        <Ionicons color={mark.iconColor} name={mark.icon} size={18} />
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <Text
          selectable
          numberOfLines={1}
          style={{
            color: palette.textStrong,
            fontFamily: Fonts.rounded,
            fontSize: 17,
            fontWeight: '800',
          }}>
          {gig.title}
        </Text>
        <Text
          selectable
          numberOfLines={1}
          style={{
            color: palette.mutedSoft,
            fontFamily: Fonts.sans,
            fontSize: 13,
          }}>
          {gig.poster.displayName} · {gig.location.city}, Philippines
        </Text>
        <Text
          selectable
          style={{
            color: palette.textStrong,
            fontFamily: Fonts.rounded,
            fontSize: 17,
            fontWeight: '800',
          }}>
          {formatCurrency(gig.priceAmount)}
          <Text style={{ fontSize: 13, fontWeight: '700' }}> per day</Text>
        </Text>
      </View>

      <View style={{ justifyContent: 'center' }}>
        <Ionicons color={palette.accentStrong} name="chevron-forward" size={18} />
      </View>
    </Pressable>
  );
}

function PosterGigRow({ gig, isLast }: { gig: OwnedGig; isLast: boolean }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const mark = getBrandMark(gig.category, palette);

  return (
    <View
      style={{
        borderBottomColor: isLast ? 'transparent' : palette.borderSoft,
        borderBottomWidth: 1,
        flexDirection: 'row',
        gap: 14,
        paddingVertical: 16,
      }}>
      <View
        style={{
          alignItems: 'center',
          backgroundColor: mark.backgroundColor,
          borderRadius: 14,
          height: 42,
          justifyContent: 'center',
          width: 42,
        }}>
        <Ionicons color={mark.iconColor} name={mark.icon} size={18} />
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <Text
          selectable
          numberOfLines={1}
          style={{
            color: palette.textStrong,
            fontFamily: Fonts.rounded,
            fontSize: 17,
            fontWeight: '800',
          }}>
          {gig.title}
        </Text>
        <Text
          selectable
          numberOfLines={2}
          style={{
            color: palette.muted,
            fontFamily: Fonts.sans,
            fontSize: 13,
            lineHeight: 18,
          }}>
          {buildPosterGigMeta(gig)}
        </Text>
      </View>

      <View
        style={{
          alignItems: 'flex-end',
          gap: 6,
          justifyContent: 'center',
        }}>
        <Text
          selectable
          style={{
            color: palette.textStrong,
            fontFamily: Fonts.rounded,
            fontSize: 14,
            fontWeight: '800',
          }}>
          {formatCurrency(gig.priceAmount)}
        </Text>
        <Text
          selectable
          style={{
            color: gig.applicationCount > 0 ? palette.accentStrong : palette.mutedSoft,
            fontFamily: Fonts.rounded,
            fontSize: 12,
            fontWeight: '700',
          }}>
          {gig.applicationCount > 0 ? `${gig.applicationCount} to review` : gigCategoryLabels[gig.category]}
        </Text>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const { accessToken, apiBaseUrl, userEmail } = useAppConfig();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [mode, setMode] = useState<HomeMode>('find');
  const [gigs, setGigs] = useState<PublicGig[]>(fallbackGigs);
  const [posterGigs, setPosterGigs] = useState<OwnedGig[]>(fallbackPosterGigs);
  const [isWorkerLoading, setIsWorkerLoading] = useState(true);
  const [isPosterLoading, setIsPosterLoading] = useState(accessToken !== '');

  useEffect(() => {
    let isMounted = true;

    setIsWorkerLoading(true);

    void fetchPublicGigs(apiBaseUrl, { limit: 6 })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        if (response.length > 0) {
          setGigs(response);
          return;
        }

        setGigs(fallbackGigs);
      })
      .catch(() => {
        if (isMounted) {
          setGigs(fallbackGigs);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsWorkerLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    let isMounted = true;

    if (accessToken === '') {
      setPosterGigs(fallbackPosterGigs);
      setIsPosterLoading(false);
      return () => {
        isMounted = false;
      };
    }

    setIsPosterLoading(true);

    void fetchMyGigs(apiBaseUrl, accessToken, { limit: 12 })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setPosterGigs(response.length > 0 ? response : fallbackPosterGigs);
      })
      .catch(() => {
        if (isMounted) {
          setPosterGigs(fallbackPosterGigs);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsPosterLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, apiBaseUrl]);

  const featured = gigs.slice(0, 3);
  const recommended = gigs.slice(1, 5);
  const activePosterGigs = posterGigs.filter((gig) => gig.status !== 'draft').slice(0, 4);
  const draftGigs = posterGigs.filter((gig) => gig.status === 'draft').slice(0, 4);
  const avatarLabel = (userEmail ?? 'R').trim().charAt(0).toUpperCase() || 'R';

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 22,
        paddingBottom: tabBarHeight + insets.bottom + 28,
        paddingHorizontal: 20,
        paddingTop: insets.top + 12,
      }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: palette.canvas }}>
      <Animated.View entering={FadeInUp.duration(400)} style={{ gap: 20 }}>
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <Pressable
            style={{
              alignItems: 'center',
              backgroundColor: palette.surface,
              borderColor: palette.borderSoft,
              borderRadius: 16,
              borderWidth: 1,
              height: 42,
              justifyContent: 'center',
              width: 42,
            }}>
            <Ionicons color={palette.textStrong} name="menu-outline" size={22} />
          </Pressable>

          <View
            style={{
              alignItems: 'center',
              backgroundColor: palette.infoSurface,
              borderRadius: 999,
              height: 42,
              justifyContent: 'center',
              overflow: 'hidden',
              width: 42,
            }}>
            <Text
              selectable
              style={{
                color: palette.infoText,
                fontFamily: Fonts.rounded,
                fontSize: 15,
                fontWeight: '800',
              }}>
              {avatarLabel}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              backgroundColor: palette.surface,
              borderColor: palette.borderSoft,
              borderRadius: 18,
              borderWidth: 1,
              flex: 1,
              flexDirection: 'row',
              padding: 4,
            }}>
            {homeModes.map((item) => {
              const isActive = mode === item.key;

              return (
                <Pressable
                  key={item.key}
                  onPress={() => setMode(item.key)}
                  style={{
                    alignItems: 'center',
                    backgroundColor: isActive ? palette.accent : 'transparent',
                    borderRadius: 14,
                    flex: 1,
                    justifyContent: 'center',
                    minHeight: 42,
                  }}>
                  <Text
                    selectable
                    style={{
                      color: isActive ? palette.inverseText : palette.textStrong,
                      fontFamily: Fonts.rounded,
                      fontSize: 13,
                      fontWeight: '700',
                    }}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              alignItems: 'center',
              backgroundColor: palette.surface,
              borderColor: palette.borderSoft,
              borderRadius: 18,
              borderWidth: 1,
              flex: 1,
              flexDirection: 'row',
              gap: 10,
              height: 56,
              paddingHorizontal: 16,
            }}>
            <Ionicons
              color={palette.accentStrong}
              name={mode === 'find' ? 'search-outline' : 'document-text-outline'}
              size={18}
            />
            <Text
              selectable
              style={{
                color: palette.placeholder,
                fontFamily: Fonts.sans,
                fontSize: 14,
              }}>
              {mode === 'find' ? 'ex: Aircon cleaning' : 'What job do you need help with?'}
            </Text>
          </View>

          <Pressable
            style={{
              alignItems: 'center',
              backgroundColor: palette.accent,
              borderRadius: 18,
              height: 56,
              justifyContent: 'center',
              width: 56,
            }}>
            <Ionicons color={palette.inverseText} name={mode === 'find' ? 'options-outline' : 'add-outline'} size={20} />
          </Pressable>
        </View>
      </Animated.View>

      {mode === 'find' ? (
        <>
          <Animated.View entering={FadeInDown.delay(70).duration(420)} style={{ gap: 14 }}>
            <SectionHeader title="Categories" />
            <ScrollView
              horizontal
              contentContainerStyle={{ gap: 10, paddingRight: 4 }}
              showsHorizontalScrollIndicator={false}>
              {categories.map((item, index) => (
                <View
                  key={item.label}
                  style={{
                    alignItems: 'center',
                    backgroundColor: index === 0 ? palette.accentMuted : palette.surface,
                    borderColor: palette.borderSoft,
                    borderRadius: 18,
                    borderWidth: 1,
                    flexDirection: 'row',
                    gap: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}>
                  <Ionicons color={index === 0 ? palette.accentStrong : palette.mutedSoft} name={item.icon} size={16} />
                  <Text
                    selectable
                    style={{
                      color: palette.textStrong,
                      fontFamily: Fonts.rounded,
                      fontSize: 14,
                      fontWeight: '700',
                    }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(420)} style={{ gap: 14 }}>
            <SectionHeader title="Featured Jobs" />
            {isWorkerLoading ? <ActivityIndicator color={palette.accentStrong} /> : null}
            <ScrollView
              horizontal
              contentContainerStyle={{ gap: 14, paddingRight: 10 }}
              showsHorizontalScrollIndicator={false}>
              {featured.map((gig) => (
                <FeaturedJobCard key={gig.id} gig={gig} />
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 14 }}>
            <SectionHeader title="Recommended" />
            <View
              style={{
                overflow: 'hidden',
              }}>
              {recommended.map((gig, index) => (
                <RecommendedJobRow key={gig.id} gig={gig} isLast={index === recommended.length - 1} />
              ))}
            </View>
          </Animated.View>
        </>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(70).duration(420)} style={{ gap: 14 }}>
            <SectionHeader title="Popular Jobs To Post" />
            <ScrollView
              horizontal
              contentContainerStyle={{ gap: 10, paddingRight: 4 }}
              showsHorizontalScrollIndicator={false}>
              {categories.map((item, index) => (
                <View
                  key={item.label}
                  style={{
                    alignItems: 'center',
                    backgroundColor: index === 0 ? palette.accentMuted : palette.surface,
                    borderColor: palette.borderSoft,
                    borderRadius: 18,
                    borderWidth: 1,
                    flexDirection: 'row',
                    gap: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                  }}>
                  <Ionicons color={index === 0 ? palette.accentStrong : palette.mutedSoft} name={item.icon} size={16} />
                  <Text
                    selectable
                    style={{
                      color: palette.textStrong,
                      fontFamily: Fonts.rounded,
                      fontSize: 14,
                      fontWeight: '700',
                    }}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(420)} style={{ gap: 14 }}>
            <SectionHeader title="Before You Publish" />
            <View
              style={{
                backgroundColor: palette.surface,
                borderColor: palette.borderSoft,
                borderRadius: 24,
                borderWidth: 1,
                overflow: 'hidden',
              }}>
              {postingChecklist.map((item, index) => (
                <View
                  key={item}
                  style={{
                    borderBottomColor: index === postingChecklist.length - 1 ? 'transparent' : palette.borderSoft,
                    borderBottomWidth: 1,
                    flexDirection: 'row',
                    gap: 12,
                    padding: 16,
                  }}>
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: palette.accentMuted,
                      borderRadius: 999,
                      height: 24,
                      justifyContent: 'center',
                      width: 24,
                    }}>
                    <Text
                      selectable
                      style={{
                        color: palette.accentStrong,
                        fontFamily: Fonts.rounded,
                        fontSize: 12,
                        fontWeight: '800',
                      }}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text
                    selectable
                    style={{
                      color: palette.text,
                      flex: 1,
                      fontFamily: Fonts.sans,
                      fontSize: 15,
                      lineHeight: 22,
                    }}>
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(420)} style={{ gap: 14 }}>
            <SectionHeader title="Your Jobs" />
            {isPosterLoading ? <ActivityIndicator color={palette.accentStrong} /> : null}
            <View style={{ overflow: 'hidden' }}>
              {activePosterGigs.length > 0 ? (
                activePosterGigs.map((gig, index) => (
                  <PosterGigRow key={gig.id} gig={gig} isLast={index === activePosterGigs.length - 1} />
                ))
              ) : (
                <Text
                  selectable
                  style={{
                    color: palette.muted,
                    fontFamily: Fonts.sans,
                    fontSize: 14,
                    lineHeight: 20,
                    paddingVertical: 8,
                  }}>
                  Your published jobs will show up here once they go live.
                </Text>
              )}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).duration(420)} style={{ gap: 14 }}>
            <SectionHeader title="Recent Drafts" />
            <View style={{ overflow: 'hidden' }}>
              {draftGigs.length > 0 ? (
                draftGigs.map((gig, index) => (
                  <PosterGigRow key={gig.id} gig={gig} isLast={index === draftGigs.length - 1} />
                ))
              ) : (
                <Text
                  selectable
                  style={{
                    color: palette.muted,
                    fontFamily: Fonts.sans,
                    fontSize: 14,
                    lineHeight: 20,
                    paddingVertical: 8,
                  }}>
                  Save a draft first if you want to prepare details before posting.
                </Text>
              )}
            </View>
          </Animated.View>
        </>
      )}
    </ScrollView>
  );
}
