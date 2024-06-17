import debounce from 'lodash.debounce';

import {
  ArticleDocument,
  EventDocument,
  FaqCategoryDocument,
  TeaserBubbleDocument,
  VideoDocument,
} from '../../../../types.generated';
import {
  Child,
  FullProfile,
  IChannelDisplay,
  ProgrammeMilestone,
  ProgrammeMilestoneTask,
  SubscriptionResponseSubscription,
  SubscriptionResponseSupplier,
  UserProfile,
} from '../../../api/apiClient.generated';
import { timeDifference } from '../../helpers/dateHelpers';

import { format, parseISO } from 'date-fns';
import analyticsMediator from './analyticsMediator';
import Debug from '../logger';
import type { Vertical } from '../../redux/slices/activeVertical';
import { AnalyticsProvider } from './types';

class AnalyticsService implements AnalyticsProvider {
  setUserId = (options: { userId: string }) => {
    return analyticsMediator.setUserId(options);
  };

  setGroup = (
    groupType: string,
    groupdIdentifier: string,
    groupPropertiesToSet?: Record<string, unknown> | undefined
  ) => {
    return analyticsMediator.setGroup(groupType, groupdIdentifier, groupPropertiesToSet);
  };

  reset = () => {
    analyticsMediator.reset();
  };

  setUserProperties = (profile: (FullProfile & UserProfile) | null) => {
    if (profile != null) {
      this.setUserId({ userId: profile.id });
      analyticsMediator.setUserProperty({ key: 'User_Type', value: profile.signUpType });
      analyticsMediator.setUserProperty({ key: 'User_Role', value: profile.role });
      analyticsMediator.setUserProperty({ key: 'Country', value: profile.countryCode });
      analyticsMediator.setUserProperty({ key: 'Last_Active', value: format(new Date(), 'yyyy-MM-dd') });
      analyticsMediator.setUserProperty({ key: 'Ethnicity', value: profile.ethnicGroupRelation?.defaultText });
      analyticsMediator.setUserProperty({ key: 'Selected_AI_Persona', value: profile.selectedAiPersona });
      analyticsMediator.setUserProperty({ key: 'Active_Programme', value: profile.programmeId });
      analyticsMediator.setUserProperty({ key: 'Pronoun_Id', value: profile.pronounId });
      analyticsMediator.setUserProperty({ key: 'Pronoun', value: profile.pronoun?.subject });
      analyticsMediator.setUserProperty({ key: 'Is_Birthing_Parent', value: profile.isBirthingParent });
      analyticsMediator.setUserProperty({ key: 'Environment', value: APP_CONFIG.environment });
      analyticsMediator.setUserProperty({ key: 'AppVersion', value: APP_CONFIG.version });
      analyticsMediator.setUserProperty({ key: 'CompletedOnboarding', value: profile.onboardingCompleted });
      analyticsMediator.setUserProperty({ key: 'PushNotificationsEnabled', value: profile.fcmToken != null });
      analyticsMediator.setUserProperty({ key: 'LSOACode', value: (profile as any).lsoaCode ?? 'none' });
      analyticsMediator.setUserProperty({ key: 'LSOAName', value: (profile as any).lsoaName ?? 'none' });
      analyticsMediator.setUserProperty({ key: 'IMD', value: (profile as any).imd ?? 'none' });

      const userPostCode = profile.postcode.replace(' ', '').toUpperCase().trim();
      const outwordWithSectorCode = userPostCode.substring(0, userPostCode.length - 2);

      analyticsMediator.setUserProperty({ key: 'Partial_Postcode', value: outwordWithSectorCode });
      analyticsMediator.setUserProperty({ key: 'Postcode', value: profile.postcode });
      analyticsMediator.setUserProperty({ key: 'isBlocked', value: profile.isBlocked });
      analyticsMediator.setUserProperty({ key: 'isMuted', value: profile.isMuted });

      if (profile.ageBand != null) {
        analyticsMediator.setUserProperty({
          key: 'AgeRange',
          value: `${profile.ageBand.minAge}-${profile.ageBand.maxAge}`,
        });
      }
      if (profile.healthCareProfessionalTeam != null) {
        analyticsMediator.setUserProperty({
          key: 'HealthTeam',
          value: profile.healthCareProfessionalTeam.team,
        });
      }

      if (profile.childInfo != null && profile.childInfo.length > 0) {
        const {
          antenatal,
          diff: [days, weeks, months],
        } = timeDifference(profile.childInfo?.[0] as Child);

        if (antenatal) {
          analyticsMediator.setUserProperty({ key: 'Antenatal', value: true });
          analyticsMediator.setUserProperty({ key: 'Pregnancy_Age', value: weeks });
        } else {
          analyticsMediator.setUserProperty({ key: 'Baby_Age', value: weeks });
          analyticsMediator.setUserProperty({ key: 'Postnatal', value: true });

          if (profile.childInfo[0].birthDate != null) {
            analyticsMediator.setUserProperty({
              key: 'Baby_Birth',
              value: format(parseISO(profile.childInfo[0].birthDate), 'yyyy-MM-dd'),
            });
          }
        }
      }

      analyticsMediator.commitUserProperties();
    }
  };

  setAppType = (vertical: Vertical | null) => analyticsMediator.setAppType(vertical);

  commitUserProperties = () => {
    return analyticsMediator.commitUserProperties();
  };

  logEvent = (options: { name: string; params: Record<string, unknown> }) => {
    return analyticsMediator.logEvent(options);
  };

  log = (name: string, params: Record<string, unknown> = {}, dryRun = false) => {
    if (dryRun) {
      Debug.log('Analytics logEvent DryRun', `${name} -> ${JSON.stringify(params)}`);
      return Promise.resolve();
    }
    return analyticsMediator.logEvent({ name, params });
  };

  logConsultationEvent = (name: string, params: Record<string, unknown> = {}) => {
    return analyticsMediator.logEvent({
      name: `consultation_${name}`,
      params,
    });
  };

  setUserProperty = ({ key, value }) => analyticsMediator.setUserProperty({ key, value });

  setCurrentScreen = (options: { screenName: string; screenNameOverride?: string | undefined }) => {
    return analyticsMediator.setCurrentScreen(options);
  };

  trackViewPage = (pageName: string, params?: Record<string, unknown>) => {
    analyticsMediator.setCurrentScreen({
      screenName: pageName,
      screenNameOverride: pageName,
      ...params,
    });
    // this.logEvent({ name: pageName, params: params ?? {} });
  };

  trackViewAnimation = (animationSession: string, selectedAnimation: string) => {
    this.trackViewPage(`Animation/${animationSession}/${selectedAnimation}`);
    analyticsMediator.logEvent({
      name: 'user_watched_animation',
      params: {
        animationSession,
        selectedAnimation,
      },
    });
  };

  trackAnimationSelected = (anim: IAnimationSelectionOption) => {
    this.logEvent({ name: 'user_selected_animation', params: { name: anim.DisplayName, premiumOnly: anim.IsPremium } });
  };

  trackAnimationMumSkinToneChanged = debounce((state: number) => {
    this.logEvent({
      name: 'user_changed_mumskin',
      params: { skin: state },
    });
  }, 300);

  trackAnimationBabySkinToneChanged = debounce((state: number) => {
    this.logEvent({
      name: 'user_changed_babyskin',
      params: { skin: state },
    });
  }, 300);

  sizes = {
    0: 'Small',
    1: 'Medium',
    2: 'Large',
  };

  trackAnimationBreastSizeChanged = debounce((htmlInput: React.ChangeEvent<HTMLInputElement>) => {
    this.logEvent({
      name: 'user_changed_breastsize',
      params: { size: this.sizes[parseInt(htmlInput.target.value, 10)] },
    });
  }, 300);

  trackAnimationHighlightUsed = debounce(() => {
    this.logEvent({
      name: 'user_changed_highlight',
      params: {},
    });
  }, 300);

  trackAnimationTransparencyUsed = debounce(() => {
    this.logEvent({
      name: 'user_changed_transparency',
      params: {},
    });
  }, 300);

  trackAnimationCameraChanged = () => {
    this.logEvent({
      name: 'user_changed_camera',
      params: {},
    });
  };

  trackAnimationCameraReset = () => {
    this.logEvent({
      name: 'user_reset_camera',
      params: {},
    });
  };

  trackAnimationPlayPressed = () => {
    this.logEvent({
      name: 'user_pressed_play',
      params: {},
    });
  };

  trackAnimationPausePressed = () => {
    this.logEvent({
      name: 'user_pressed_pause',
      params: {},
    });
  };

  trackAnimationAudioMuted = () => {
    this.logEvent({
      name: 'user_muted_audio',
      params: {},
    });
  };

  trackAnimationAudioUnmuted = () => {
    this.logEvent({
      name: 'user_unmuted_audio',
      params: {},
    });
  };

  trackMyChatsViewThread = (threadId: string | undefined) => {
    if (threadId) {
      this.trackViewPage(`MyChats/Thread`, { threadId });
    } else {
      this.logEvent({ name: 'thread_failed_to_load', params: { threadId } });
    }
  };

  trackMyChatsUnallocatedView = () => {
    this.trackViewPage(`MyChats/Unallocated`);
  };

  trackMyChatsView = () => {
    this.trackViewPage(`MyChats`);
  };

  trackCommunityChannelEntered = (channel: IChannelDisplay | undefined) => {
    if (channel != null) {
      this.trackViewPage(`Community/${channel.name}/chat`);
      this.logEvent({
        name: 'user_entered_community_channel',
        params: { name: channel.name, type: channel.channelType },
      });
    }
  };

  trackCommunityChannelExited = (channel: IChannelDisplay | undefined) => {
    if (channel != null) {
      this.logEvent({
        name: 'user_exited_community_channel',
        params: { name: channel.name, type: channel.channelType },
      });
    }
  };

  trackCommunityInfoEntered = (channel: IChannelDisplay | undefined) => {
    if (channel != null) {
      this.trackViewPage(`Community/${channel.name}/info`);
      this.logEvent({ name: 'user_entered_community_info', params: { name: channel.name, type: channel.channelType } });
    }
  };

  trackCommunityInfoExited = (channel: IChannelDisplay | undefined) => {
    if (channel != null) {
      this.logEvent({ name: 'user_exited_community_info', params: { name: channel.name, type: channel.channelType } });
    }
  };

  trackViewCommunityMemberProfile = (memberId: string | undefined) => {
    if (memberId != null) {
      this.trackViewPage(`Community/ChannelMember`, { memberId });
      this.logEvent({ name: 'user_viewed_community_member', params: { memberId } });
    }
  };

  trackCommunitySendMessage = (community?: string) => {
    if (community != null) {
      this.logEvent({ name: 'user_sent_community_message', params: { channelId: community } });
    }
  };

  trackCommunityDeleteMessage = (community?: string, userId?: string, messageId?: string) => {
    if (community != null) {
      this.logEvent({
        name: 'user_deleted_community_message',
        params: { channelId: community, userWhoseMessageDeleted: userId, messageId },
      });
    }
  };

  trackViewFAQAnswers = (category: FaqCategoryDocument<string> | undefined) => {
    if (category != null) {
      this.trackViewPage(`FAQs/${category?.data.name}/answers`, { id: category.id, language: category.lang });
    }
  };

  trackViewFAQCategory = (category: FaqCategoryDocument<string> | undefined) => {
    if (category != null) {
      this.trackViewPage(`FAQs/${category?.data.name}`, { id: category.id, language: category.lang });
    }
  };

  trackViewVideoPage = (video: VideoDocument<string> | undefined) => {
    if (video != null) {
      this.trackViewPage(`Videos/${video.data.title}`, { id: video.id, language: video.lang });
    }
  };

  trackFeedbackFormSubmitted = () => {
    this.logEvent({ name: 'user_sent_feedback_form', params: {} });
  };

  trackUserOnboarding = (page: number) => {
    this.trackViewPage(`Onboarding/${page}`, { page });
  };

  trackViewActiveSubscription = (
    info: {
      corporateAvailable: SubscriptionResponseSupplier | null;
      nhsAvailable: SubscriptionResponseSupplier | null;
      pilotAvailable: SubscriptionResponseSupplier | null;
      subscription: SubscriptionResponseSubscription | null;
    } | null
  ) => {
    if (info != null) {
      if (info.subscription != null) {
        this.trackViewPage('Subscription/Active Subscription', {
          subscribed: true,
          supplier: info.subscription.supplier.name,
        });
      } else {
        let availableSupplier: SubscriptionResponseSupplier | null = info.corporateAvailable;
        if (availableSupplier == null) {
          availableSupplier = info.nhsAvailable;
        }
        if (availableSupplier == null) {
          availableSupplier = info.pilotAvailable;
        }

        if (availableSupplier != null) {
          this.trackViewPage('Subscription/Active Subscription', {
            subscribed: false,
            available: availableSupplier.name,
          });
        } else {
          this.trackViewPage('Subscription/Active Subscription', { subscribed: false, available: 'none' });
        }
      }
    } else {
      this.trackViewPage('Subscription/Active Subscription', { subscribed: false, available: 'none' });
    }
  };

  trackCorporateEmailSent = () => {
    this.trackViewPage('Subscriptions/Corporate Email Sent');
    this.logEvent({ name: 'user_started_corporate_verification', params: {} });
  };

  trackCorporateEmailVerified = () => {
    this.trackViewPage('Subscriptions/Corporate Email Verified');
    this.logEvent({ name: 'user_completed_corporate_verification', params: {} });
  };

  trackUserLogOut = () => {
    this.logEvent({ name: 'user_logged_out', params: { forced: false } });
    this.reset();
  };

  trackUserForceLogOut = () => {
    this.logEvent({ name: 'user_logged_out', params: { forced: true } });
  };

  trackUserLogIn = () => {
    this.logEvent({ name: 'user_logged_in', params: {} });
  };

  trackAnyaOpened = () => {
    this.trackViewPage('Anya');
    this.logEvent({ name: 'user_opened_anya', params: {} });
  };

  trackAnyaClosed = () => {
    this.logEvent({ name: 'user_closed_anya', params: {} });
  };

  trackAnyaUsedPredeterminedQuestion = (autoMessage: string) => {
    this.logEvent({ name: 'user_opened_anya', params: { message: autoMessage, source: 'programme' } });
  };

  trackAnyaSentMessage = (params?: { messageText: string; suggested: boolean }) => {
    this.logEvent({ name: 'user_sent_anya_message', params: { suggested: false, ...params } });
  };

  trackAnyaSentSuggestedMessage = (messageText: string) => {
    this.trackAnyaSentMessage({ messageText, suggested: true });
  };

  trackAnyaPersonaChanged = (persona: string) => {
    this.logEvent({ name: 'user_changed_anya_persona', params: { persona } });
  };

  trackAnyaColorChanged = debounce((colorProgress: number) => {
    this.logEvent({ name: 'user_changed_anya_color', params: { value: colorProgress } });
  }, 300);

  trackShownTeaserBubble = (teaserContent: TeaserBubbleDocument, prompt: number) => {
    this.logEvent({
      name: 'user_shown_teaser_bubble',
      params: {
        id: teaserContent.id,
        ...teaserContent.tags.map(t => ({ [t]: true })),
        prompt,
      },
    });
  };

  trackInteractTeaserBubble = (teaserContent?: TeaserBubbleDocument) => {
    this.logEvent({
      name: 'user_clicked_teaser_bubble',
      params: {
        id: teaserContent?.id,
        ...teaserContent?.tags.map(t => ({ [t]: true })),
      },
    });
  };

  trackCloseTeaserBubble = (teaserContent?: TeaserBubbleDocument) => {
    if (teaserContent != null) {
      this.logEvent({
        name: 'user_closed_teaser_bubble',
        params: {
          id: teaserContent.id,
          ...teaserContent.tags.map(t => ({ [t]: true })),
        },
      });
    }
  };

  trackShowPaywall = () => {
    this.logEvent({
      name: 'user_triggered_paywall',
      params: {},
    });
  };

  trackGetPremiumFromPaywall = () => {
    this.logEvent({
      name: 'user_pressed_get_premium',
      params: { source: 'paywall' },
    });
  };

  trackDeleteAccount = () => {
    this.logEvent({
      name: 'user_deleted_account',
      params: {},
    });
  };

  trackDeleteAccountCancelled = () => {
    this.logEvent({
      name: 'user_cancelled_delete_account',
      params: {},
    });
  };

  trackPushNotificationAutoAction = (title: string | undefined) => {
    this.logEvent({
      name: 'push_notification_handled',
      params: {
        automatic: true,
        title,
      },
    });
  };

  trackInAppPushNotificationActionDialog = (title: string | undefined) => {
    this.logEvent({
      name: 'push_notification_handled',
      params: {
        title,
        automatic: false,
      },
    });
  };

  trackInAppPushNotificationInteracted = (title: string | undefined, type: string, data: string) => {
    this.logEvent({
      name: 'user_interacted_push_notification',
      params: {
        title,
        type,
        data,
      },
    });
  };

  trackClickProgrammeTask = (task: ProgrammeMilestoneTask) => {
    this.logEvent({
      name: 'user_clicked_programme_task',
      params: {
        target: task.target,
        action: task.action,
        type: task.itemType,
      },
    });
  };

  trackHideProgrammeMilestone = (milestone: ProgrammeMilestone) => {
    this.logEvent({
      name: 'user_hid_programme_milestone',
      params: {
        id: milestone.id,
        isActiveMilestone: milestone.isActive,
        name: milestone.name,
      },
    });
  };

  trackShowProgrammeMilestone = (milestone: ProgrammeMilestone) => {
    this.logEvent({
      name: 'user_show_programme_milestone',
      params: {
        id: milestone.id,
        isActiveMilestone: milestone.isActive,
        name: milestone.name,
      },
    });
  };

  trackReachedArticleBottom = (article: ArticleDocument | undefined) => {
    if (article != null) {
      this.logEvent({
        name: 'user_read_article',
        params: {
          id: article.id,
          title: article.data.title,
          premiumOnly: article.tags.includes('premium'),
        },
      });
    }
  };

  trackReachedEventBottom = (event: EventDocument | undefined) => {
    if (event != null) {
      this.logEvent({
        name: 'user_read_event',
        params: {
          id: event.id,
          title: event.data.title,
          premiumOnly: event.tags.includes('premium'),
        },
      });
    }
  };

  trackBlockedPremiumContent = (content: ArticleDocument | VideoDocument | EventDocument | undefined) => {
    if (content != null) {
      this.logEvent({
        name: 'user_reached_content_paywall',
        params: {
          id: content.id,
          title: content.data.title,
          type: content.type,
          premiumOnly: true,
        },
      });
    }
  };

  trackViewPremiumContent = (content: ArticleDocument | VideoDocument | EventDocument | undefined) => {
    if (content != null) {
      this.logEvent({
        name: 'user_viewed_premium_content',
        params: {
          id: content.id,
          title: content.data.title,
          type: content.type,
          premiumOnly: true,
        },
      });
    }
  };

  trackNotesUsed = debounce(() => {
    this.logEvent({
      name: 'user_changed_profile_notes',
      params: {},
    });
  }, 1000);

  trackUpdateProfile = () => {
    this.logEvent({
      name: 'user_updated_profile',
      params: {},
    });
  };

  trackApiError = (
    endpoint: string,
    details: { apiStatus: string | number; connectionType: string; connectedToInternet: boolean }
  ) => {
    this.logEvent({
      name: `api_error`,
      params: { ...details, endpoint },
    });
  };

  debouncedEvent = debounce((eventFunction: any, ...eventParams: any) => {
    eventFunction(...eventParams);
  }, 300);

  wrapClickWithEvent = (clickFunction: any, eventFunction: any) => {
    return (params?: any) => {
      eventFunction(params);
      return clickFunction(params);
    };
  };
}

export default new AnalyticsService();
