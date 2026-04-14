import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppConfig } from '@/components/app-config-provider';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  fetchGigApplicationsForPoster,
  fetchMyGigs,
  fundGigHire,
  formatCurrency,
  reviewGigApplication,
  type OwnedGig,
  type PosterGigApplicationSummary,
} from '@/lib/api';

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

function formatGigState(gig: OwnedGig) {
  if (gig.status === 'published' && gig.applicationCount > 0) {
    return 'Reviewing applicants';
  }

  if (gig.status === 'published') {
    return 'Live';
  }

  if (gig.status === 'draft') {
    return 'Draft';
  }

  return gig.status.replace(/_/g, ' ');
}

function formatApplicantState(status: PosterGigApplicationSummary['status']) {
  switch (status) {
    case 'submitted':
      return 'Open';
    case 'rejected':
      return 'Rejected';
    case 'hired':
      return 'Hired';
    case 'closed':
      return 'Closed';
    case 'withdrawn':
      return 'Withdrawn';
    default:
      return status;
  }
}

function SectionTitle({ title, value }: { title: string; value?: string }) {
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
      {value ? (
        <Text
          selectable
          style={{
            color: palette.muted,
            fontFamily: Fonts.sans,
            fontSize: 13,
          }}>
          {value}
        </Text>
      ) : null}
    </View>
  );
}

function GigRow({
  gig,
  isSelected,
  onPress,
}: {
  gig: OwnedGig;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: isSelected ? palette.accentSoft : palette.surface,
        borderColor: isSelected ? palette.accentStrong : palette.borderSoft,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        padding: 16,
      }}>
      <Text
        selectable
        numberOfLines={2}
        style={{
          color: palette.textStrong,
          fontFamily: Fonts.rounded,
          fontSize: 16,
          fontWeight: '800',
          lineHeight: 22,
        }}>
        {gig.title}
      </Text>
      <Text
        selectable
        style={{
          color: palette.muted,
          fontFamily: Fonts.sans,
          fontSize: 13,
          lineHeight: 18,
        }}>
        {formatGigState(gig)} · {gig.applicationCount} applicants · {gig.location.city}
      </Text>
      <Text
        selectable
        style={{
          color: palette.textStrong,
          fontFamily: Fonts.rounded,
          fontSize: 15,
          fontWeight: '800',
        }}>
        {formatCurrency(gig.priceAmount)}
      </Text>
    </Pressable>
  );
}

function ApplicantRow({
  applicant,
  isBusy,
  onFundHire,
  onReject,
  onReopen,
}: {
  applicant: PosterGigApplicationSummary;
  isBusy: boolean;
  onFundHire: () => void;
  onReject: () => void;
  onReopen: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const initials = getInitials(applicant.worker.displayName);
  const isRejected = applicant.status === 'rejected';
  const isSubmitted = applicant.status === 'submitted';
  const isHired = applicant.status === 'hired';

  return (
    <View
      style={{
        borderBottomColor: palette.borderSoft,
        borderBottomWidth: 1,
        gap: 14,
        paddingVertical: 16,
      }}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <View
          style={{
            alignItems: 'center',
            backgroundColor: palette.infoSurface,
            borderRadius: 999,
            height: 46,
            justifyContent: 'center',
            width: 46,
          }}>
          <Text
            selectable
            style={{
              color: palette.infoText,
              fontFamily: Fonts.rounded,
              fontSize: 13,
              fontWeight: '800',
            }}>
            {initials}
          </Text>
        </View>

        <View style={{ flex: 1, gap: 6 }}>
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
                fontSize: 16,
                fontWeight: '800',
              }}>
              {applicant.worker.displayName}
            </Text>
            <Text
              selectable
              style={{
                color: isRejected ? palette.muted : palette.accentStrong,
                fontFamily: Fonts.rounded,
                fontSize: 12,
                fontWeight: '700',
                textTransform: 'capitalize',
              }}>
              {formatApplicantState(applicant.status)}
            </Text>
          </View>

          <Text
            selectable
            numberOfLines={2}
            style={{
              color: palette.muted,
              fontFamily: Fonts.sans,
              fontSize: 13,
              lineHeight: 19,
            }}>
            {[applicant.worker.barangay, applicant.worker.city].filter(Boolean).join(', ') || 'Location not set'}
            {' · '}
            {applicant.worker.stats.jobsCompleted} jobs
            {' · '}
            {applicant.worker.stats.responseRate}% response
          </Text>

          <Text
            selectable
            style={{
              color: palette.text,
              fontFamily: Fonts.sans,
              fontSize: 14,
              lineHeight: 20,
            }}>
            {applicant.intro}
          </Text>

          <Text
            selectable
            style={{
              color: palette.mutedSoft,
              fontFamily: Fonts.sans,
              fontSize: 13,
              lineHeight: 18,
            }}>
            Availability: {applicant.availability}
          </Text>

          {applicant.worker.skills.length > 0 ? (
            <Text
              selectable
              numberOfLines={2}
              style={{
                color: palette.muted,
                fontFamily: Fonts.sans,
                fontSize: 13,
                lineHeight: 18,
              }}>
              Skills: {applicant.worker.skills.join(' · ')}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        {isSubmitted ? (
          <>
            <Pressable
              disabled={isBusy}
              onPress={onFundHire}
              style={{
                alignItems: 'center',
                backgroundColor: palette.text,
                borderRadius: 999,
                justifyContent: 'center',
                minHeight: 40,
                minWidth: 120,
                opacity: isBusy ? 0.6 : 1,
                paddingHorizontal: 14,
              }}>
              <Text
                selectable
                style={{
                  color: palette.background,
                  fontFamily: Fonts.rounded,
                  fontSize: 12,
                  fontWeight: '800',
                }}>
                Fund hire
              </Text>
            </Pressable>

            <Pressable
              disabled={isBusy}
              onPress={onReject}
              style={{
                alignItems: 'center',
                backgroundColor: palette.accent,
                borderRadius: 999,
                justifyContent: 'center',
                minHeight: 40,
                minWidth: 120,
                opacity: isBusy ? 0.6 : 1,
                paddingHorizontal: 14,
              }}>
              <Text
                selectable
                style={{
                  color: palette.inverseText,
                  fontFamily: Fonts.rounded,
                  fontSize: 12,
                  fontWeight: '800',
                }}>
                Reject
              </Text>
            </Pressable>
          </>
        ) : null}

        {isRejected ? (
          <Pressable
            disabled={isBusy}
            onPress={onReopen}
            style={{
              alignItems: 'center',
              backgroundColor: palette.text,
              borderRadius: 999,
              justifyContent: 'center',
              minHeight: 40,
              minWidth: 120,
              opacity: isBusy ? 0.6 : 1,
              paddingHorizontal: 14,
            }}>
            <Text
              selectable
              style={{
                color: palette.background,
                fontFamily: Fonts.rounded,
                fontSize: 12,
                fontWeight: '800',
              }}>
              Keep Open
            </Text>
          </Pressable>
        ) : null}

        {isHired ? (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: palette.borderSoft,
              borderRadius: 999,
              justifyContent: 'center',
              minHeight: 40,
              minWidth: 120,
              paddingHorizontal: 14,
            }}>
            <Text
              selectable
              style={{
                color: palette.muted,
                fontFamily: Fonts.rounded,
                fontSize: 12,
                fontWeight: '800',
              }}>
              Hire Funded
            </Text>
          </View>
        ) : null}

        {isBusy ? <ActivityIndicator color={palette.accentStrong} style={{ alignSelf: 'center' }} /> : null}
      </View>
    </View>
  );
}

export default function ReviewScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { accessToken, apiBaseUrl } = useAppConfig();

  const [gigs, setGigs] = useState<OwnedGig[]>([]);
  const [selectedGigId, setSelectedGigId] = useState<string | null>(null);
  const [applications, setApplications] = useState<PosterGigApplicationSummary[]>([]);
  const [isLoadingGigs, setIsLoadingGigs] = useState(accessToken !== '');
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [busyApplicationId, setBusyApplicationId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (accessToken === '') {
      setGigs([]);
      setSelectedGigId(null);
      setApplications([]);
      setIsLoadingGigs(false);
      setNotice('Sign in to review applicants.');
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingGigs(true);

    void fetchMyGigs(apiBaseUrl, accessToken, { limit: 20, status: 'published' })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        const gigsWithApplicants = response.filter((gig) => gig.applicationCount > 0);
        setGigs(gigsWithApplicants);
        setSelectedGigId((current) =>
          gigsWithApplicants.some((gig) => gig.id === current) ? current : (gigsWithApplicants[0]?.id ?? null)
        );
        setNotice(gigsWithApplicants.length === 0 ? 'No applicants to review yet.' : null);
      })
      .catch(() => {
        if (isMounted) {
          setGigs([]);
          setSelectedGigId(null);
          setApplications([]);
          setNotice('Unable to load your active job posts right now.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingGigs(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, apiBaseUrl]);

  useEffect(() => {
    let isMounted = true;

    if (accessToken === '' || selectedGigId == null) {
      setApplications([]);
      setIsLoadingApplications(false);
      return () => {
        isMounted = false;
      };
    }

    setIsLoadingApplications(true);

    void fetchGigApplicationsForPoster(apiBaseUrl, accessToken, selectedGigId)
      .then((response) => {
        if (isMounted) {
          setApplications(response.applications);
        }
      })
      .catch(() => {
        if (isMounted) {
          setApplications([]);
          setNotice('Unable to load applicants for this job right now.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingApplications(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [accessToken, apiBaseUrl, selectedGigId]);

  const selectedGig = useMemo(
    () => gigs.find((gig) => gig.id === selectedGigId) ?? null,
    [gigs, selectedGigId]
  );

  const totalApplicants = gigs.reduce((sum, gig) => sum + gig.applicationCount, 0);

  async function handleReview(applicationId: string, status: 'submitted' | 'rejected') {
    if (selectedGigId == null || accessToken === '') {
      return;
    }

    setBusyApplicationId(applicationId);
    setNotice(null);

    try {
      const updated = await reviewGigApplication(apiBaseUrl, accessToken, selectedGigId, applicationId, status);

      setApplications((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch {
      setNotice('Unable to update this applicant right now.');
    } finally {
      setBusyApplicationId(null);
    }
  }

  async function handleFundHire(applicationId: string) {
    if (selectedGigId == null || accessToken === '') {
      return;
    }

    setBusyApplicationId(applicationId);
    setNotice(null);

    try {
      const result = await fundGigHire(apiBaseUrl, accessToken, selectedGigId, applicationId);

      setGigs((current) => {
        const remaining = current.filter((gig) => gig.id !== selectedGigId);
        setSelectedGigId((selected) => {
          if (selected !== selectedGigId) {
            return selected;
          }

          return remaining[0]?.id ?? null;
        });

        return remaining;
      });
      setApplications([]);
      setNotice(
        `Mock checkout passed. ${formatCurrency(result.payment.amount, result.payment.currency)} paid via ${result.checkout.providerReference}.`
      );
    } catch {
      setNotice('Unable to fund this hire right now.');
    } finally {
      setBusyApplicationId(null);
    }
  }

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
      style={{ backgroundColor: palette.background }}>
      <Animated.View entering={FadeInUp.duration(320)} style={{ gap: 6 }}>
        <Text
          selectable
          style={{
            color: palette.textStrong,
            fontFamily: Fonts.rounded,
            fontSize: 30,
            fontWeight: '800',
            lineHeight: 34,
          }}>
          Hiring
        </Text>
        <Text
          selectable
          style={{
            color: palette.muted,
            fontFamily: Fonts.sans,
            fontSize: 14,
            lineHeight: 20,
          }}>
          Review applicants, keep your live jobs organized, and decide who moves forward.
        </Text>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(60).duration(360)}
        style={{
          backgroundColor: palette.accentSoft,
          borderRadius: 24,
          gap: 8,
          padding: 18,
        }}>
        <Text
          selectable
          style={{
            color: palette.textStrong,
            fontFamily: Fonts.rounded,
            fontSize: 18,
            fontWeight: '800',
          }}>
          {gigs.length} active job posts
        </Text>
        <Text
          selectable
          style={{
            color: palette.muted,
            fontFamily: Fonts.sans,
            fontSize: 14,
            lineHeight: 20,
          }}>
          {totalApplicants} total applicants across your published jobs.
        </Text>
      </Animated.View>

      {notice ? (
        <Text
          selectable
          style={{
            color: palette.muted,
            fontFamily: Fonts.sans,
            fontSize: 13,
            lineHeight: 19,
          }}>
          {notice}
        </Text>
      ) : null}

      <Animated.View entering={FadeInDown.delay(120).duration(380)} style={{ gap: 10 }}>
        <SectionTitle title="Jobs Needing Review" value={`${gigs.length} live`} />
        {isLoadingGigs ? <ActivityIndicator color={palette.accentStrong} /> : null}
        <View style={{ gap: 10 }}>
          {gigs.map((gig) => (
            <GigRow
              key={gig.id}
              gig={gig}
              isSelected={gig.id === selectedGigId}
              onPress={() => setSelectedGigId(gig.id)}
            />
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(400)} style={{ gap: 10 }}>
        <SectionTitle
          title={selectedGig ? 'Applicants' : 'Applicant List'}
          value={selectedGig ? selectedGig.title : undefined}
        />
        {isLoadingApplications ? <ActivityIndicator color={palette.accentStrong} /> : null}
        {selectedGig == null ? (
          <Text
            selectable
            style={{
              color: palette.muted,
              fontFamily: Fonts.sans,
              fontSize: 14,
              lineHeight: 20,
            }}>
            Choose a live job to see its applicants.
          </Text>
        ) : (
          <View style={{ overflow: 'hidden' }}>
            {applications.map((applicant) => (
              <ApplicantRow
                key={applicant.id}
                applicant={applicant}
                isBusy={busyApplicationId === applicant.id}
                onFundHire={() => void handleFundHire(applicant.id)}
                onReject={() => void handleReview(applicant.id, 'rejected')}
                onReopen={() => void handleReview(applicant.id, 'submitted')}
              />
            ))}
            {applications.length === 0 && !isLoadingApplications ? (
              <Text
                selectable
                style={{
                  color: palette.muted,
                  fontFamily: Fonts.sans,
                  fontSize: 14,
                  lineHeight: 20,
                }}>
                No applicants have come in for this job yet.
              </Text>
            ) : null}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}
