import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppConfig } from '@/components/app-config-provider';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fetchMyProfile, type ProfileResponse } from '@/lib/api';

const coverImageUri =
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80';
const avatarImageUri =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80';

type ProfileData = ProfileResponse['profile'];

function formatDisplayName(email: string | null) {
  if (email == null || email.trim() === '') {
    return 'Raket Worker';
  }

  const localPart = email.split('@')[0] ?? '';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();

  if (cleaned === '') {
    return email;
  }

  return cleaned.replace(/\b\w/g, (character) => character.toUpperCase());
}

function createFallbackProfile(email: string | null): ProfileData {
  return {
    id: 'fallback-profile',
    displayName: formatDisplayName(email),
    city: 'Pasig',
    barangay: 'Kapitolyo',
    latitude: null,
    longitude: null,
    serviceRadiusKm: 8,
    bio: 'Available for aircon cleaning, house help, moving support, and quick errand jobs around nearby areas.',
    skills: ['Aircon cleaning', 'House help', 'Moving support', 'Errand runner'],
    stats: {
      rating: 4.8,
      reviewCount: 36,
      jobsCompleted: 18,
      responseRate: 94,
    },
  };
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'R';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function ReviewStars({ rating }: { rating: number }) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View style={{ alignItems: 'center', flexDirection: 'row', gap: 4 }}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Ionicons
          key={index}
          color={palette.ratingStar}
          name={rating >= index + 1 ? 'star' : rating >= index + 0.5 ? 'star-half' : 'star-outline'}
          size={15}
        />
      ))}
    </View>
  );
}

function DetailSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View
      style={{
        borderBottomColor: palette.border,
        borderBottomWidth: 1,
        gap: 10,
        paddingVertical: 18,
      }}>
      <Text
        selectable
        style={{
          color: palette.muted,
          fontFamily: Fonts.rounded,
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { accessToken, apiBaseUrl, signOut, userEmail } = useAppConfig();

  const [profile, setProfile] = useState<ProfileData>(() => createFallbackProfile(userEmail));
  const [isLoading, setIsLoading] = useState(accessToken !== '');
  const [loadNotice, setLoadNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (accessToken === '') {
      setProfile(createFallbackProfile(userEmail));
      setIsLoading(false);
      setLoadNotice(null);
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);

    void fetchMyProfile(apiBaseUrl, accessToken)
      .then((nextProfile) => {
        if (!isMounted) {
          return;
        }

        setProfile(nextProfile);
        setLoadNotice(null);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setProfile(createFallbackProfile(userEmail));
        setLoadNotice('Showing local profile details while account data loads.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, apiBaseUrl, userEmail]);

  const displayName = profile.displayName.trim() === '' ? formatDisplayName(userEmail) : profile.displayName;
  const locationLabel = [profile.barangay, profile.city].filter(Boolean).join(', ') || 'Set your location';
  const initials = getInitials(displayName);
  const skills = profile.skills.length > 0 ? profile.skills : createFallbackProfile(userEmail).skills;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: tabBarHeight + insets.bottom + 32,
        paddingTop: insets.top,
      }}
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: palette.background }}>
      <Animated.View entering={FadeInUp.duration(420)}>
        <View style={{ marginHorizontal: -0 }}>
          <View
            style={{
              backgroundColor: palette.profileCoverSurface,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
              height: 320,
              overflow: 'hidden',
            }}>
            <Image
              contentFit="cover"
              source={{ uri: coverImageUri }}
              style={{
                height: '100%',
                width: '100%',
              }}
            />

            <View
              style={{
                backgroundColor: palette.overlayDark,
                bottom: 0,
                left: 0,
                position: 'absolute',
                right: 0,
                top: 0,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                left: 20,
                position: 'absolute',
                right: 20,
                top: 16,
              }}>
              <Pressable
                style={{
                  alignItems: 'center',
                  backgroundColor: palette.overlayLight,
                  borderRadius: 999,
                  height: 40,
                  justifyContent: 'center',
                  width: 40,
                }}>
                <Ionicons color={palette.inverseText} name="settings-outline" size={20} />
              </Pressable>

              {isLoading ? (
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: palette.overlayLight,
                    borderRadius: 999,
                    height: 40,
                    justifyContent: 'center',
                    width: 40,
                  }}>
                  <ActivityIndicator color={palette.inverseText} size="small" />
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(80).duration(420)}
        style={{
          gap: 22,
          marginTop: -56,
          paddingHorizontal: 20,
        }}>
        <View style={{ alignItems: 'flex-start' }}>
          <View
            style={{
              backgroundColor: palette.background,
              borderRadius: 999,
              padding: 6,
            }}>
            <View
              style={{
                backgroundColor: palette.profileAvatarSurface,
                borderRadius: 999,
                height: 104,
                overflow: 'hidden',
                width: 104,
              }}>
              <Image
                contentFit="cover"
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
                source={{ uri: avatarImageUri }}
                style={{
                  height: '100%',
                  width: '100%',
                }}
              />
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: palette.imageOverlay,
                  bottom: 0,
                  justifyContent: 'center',
                  left: 0,
                  position: 'absolute',
                  right: 0,
                  top: 0,
                }}>
                <Text
                  selectable
                  style={{
                    color: palette.inverseText,
                    fontFamily: Fonts.rounded,
                    fontSize: 26,
                    fontWeight: '800',
                    opacity: 0.92,
                  }}>
                  {initials}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text
            selectable
            style={{
              color: palette.text,
              fontFamily: Fonts.rounded,
              fontSize: 30,
              fontWeight: '800',
              lineHeight: 34,
            }}>
            {displayName}
          </Text>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
            <View
              style={{
                backgroundColor: palette.accent,
                borderRadius: 999,
                height: 8,
                width: 8,
              }}
            />
            <Text
              selectable
              style={{
                color: palette.muted,
                fontFamily: Fonts.sans,
                fontSize: 15,
                lineHeight: 22,
              }}>
              Available for nearby side gigs
            </Text>
          </View>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 8 }}>
            <ReviewStars rating={profile.stats.rating} />
            <Text
              selectable
              style={{
                color: palette.muted,
                fontFamily: Fonts.sans,
                fontSize: 14,
              }}>
              {profile.stats.reviewCount} reviews
            </Text>
          </View>
          <Text
            selectable
            style={{
              color: palette.muted,
              fontFamily: Fonts.sans,
              fontSize: 14,
              lineHeight: 20,
            }}>
            {profile.stats.jobsCompleted} jobs done · {profile.stats.responseRate}% response rate
          </Text>
          <Text
            selectable
            style={{
              color: palette.muted,
              fontFamily: Fonts.sans,
              fontSize: 16,
              lineHeight: 24,
            }}>
            {locationLabel}
          </Text>
          <Text
            selectable
            numberOfLines={1}
            style={{
              color: palette.muted,
              fontFamily: Fonts.sans,
              fontSize: 14,
              lineHeight: 20,
            }}>
            {skills.slice(0, 4).join(' · ')}
          </Text>
        </View>

        <View
          style={{
            borderBottomColor: palette.border,
            borderTopColor: palette.border,
            borderBottomWidth: 1,
            borderTopWidth: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: 18,
          }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              selectable
              style={{
                color: palette.text,
                fontFamily: Fonts.rounded,
                fontSize: 22,
                fontVariant: ['tabular-nums'],
                fontWeight: '800',
              }}>
              {profile.stats.rating.toFixed(1)}
            </Text>
            <Text
              selectable
              style={{
                color: palette.muted,
                fontFamily: Fonts.sans,
                fontSize: 13,
              }}>
              Rating
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              selectable
              style={{
                color: palette.text,
                fontFamily: Fonts.rounded,
                fontSize: 22,
                fontVariant: ['tabular-nums'],
                fontWeight: '800',
              }}>
              {profile.stats.jobsCompleted}
            </Text>
            <Text
              selectable
              style={{
                color: palette.muted,
                fontFamily: Fonts.sans,
                fontSize: 13,
              }}>
              Jobs done
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              selectable
              style={{
                color: palette.text,
                fontFamily: Fonts.rounded,
                fontSize: 22,
                fontVariant: ['tabular-nums'],
                fontWeight: '800',
              }}>
              {profile.stats.responseRate}%
            </Text>
            <Text
              selectable
              style={{
                color: palette.muted,
                fontFamily: Fonts.sans,
                fontSize: 13,
              }}>
              Response
            </Text>
          </View>
        </View>

        {loadNotice ? (
          <Text
            selectable
            style={{
              color: palette.muted,
              fontFamily: Fonts.sans,
              fontSize: 13,
              lineHeight: 19,
            }}>
            {loadNotice}
          </Text>
        ) : null}

        <DetailSection title="About">
          <Text
            selectable
            style={{
              color: palette.text,
              fontFamily: Fonts.sans,
              fontSize: 16,
              lineHeight: 24,
            }}>
            {profile.bio ?? 'Add a short bio so clients can quickly understand what kind of work you take on.'}
          </Text>
        </DetailSection>

        <DetailSection title="Coverage">
          <View style={{ gap: 12 }}>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
              <Ionicons color={palette.accentStrong} name="navigate-outline" size={18} />
              <Text
                selectable
                style={{
                  color: palette.text,
                  fontFamily: Fonts.sans,
                  fontSize: 16,
                }}>
                {profile.serviceRadiusKm} km service radius
              </Text>
            </View>
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
              <Ionicons color={palette.accentStrong} name="location-outline" size={18} />
              <Text
                selectable
                style={{
                  color: palette.text,
                  fontFamily: Fonts.sans,
                  fontSize: 16,
                }}>
                {locationLabel}
              </Text>
            </View>
          </View>
        </DetailSection>

        <DetailSection title="Account">
          <Text
            selectable
            style={{
              color: palette.text,
              fontFamily: Fonts.sans,
              fontSize: 16,
              lineHeight: 24,
            }}>
            {userEmail ?? 'No email available'}
          </Text>
        </DetailSection>

        <Pressable
          onPress={() => {
            void signOut();
          }}
          style={{
            alignItems: 'center',
            backgroundColor: palette.text,
            borderCurve: 'continuous',
            borderRadius: 18,
            justifyContent: 'center',
            marginTop: 6,
            minHeight: 56,
          }}>
          <Text
            style={{
              color: palette.background,
              fontFamily: Fonts.rounded,
              fontSize: 16,
              fontWeight: '700',
            }}>
            Sign out
          </Text>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}
