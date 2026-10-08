import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { errorMessage } from '../../api/apiClient';
import { useAppShell } from '../../app/AppShellProvider';
import { AppIcon, iconSize } from '../../components/icons';
import {
  AlertBanner,
  AppText,
  Button,
  Card,
  Input,
  Skeleton,
} from '../../components/ui';
import { useCategories } from '../../hooks/useCustomerData';
import {
  useCreateProviderService,
  useDeleteProviderService,
  useProviderCategoryUpdate,
  useProviderDashboard,
  useProviderServices,
  useUpdateProviderService,
} from '../../hooks/useProviderWorkspace';
import {
  ProviderServiceInput,
  ProviderWorkspaceService,
} from '../../types/providerWorkspace';
import { layout, radius, spacing, useAppTheme } from '../../theme';

const PROVIDER_SURFACE_RADIUS = 28;
const MAX_SERVICE_PRICE = 1_000_000;

export function ProviderServicesScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const { providerTier } = useAppShell();
  const premium = providerTier === 'LOCALSEWA_PLUS';

  const {
    data: serviceData,
    isLoading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
    isRefetching: servicesRefetching,
  } = useProviderServices();
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
    isRefetching: dashboardRefetching,
  } = useProviderDashboard();
  const {
    data: categories = [],
    refetch: refetchCategories,
    isRefetching: categoriesRefetching,
  } = useCategories();

  const createService = useCreateProviderService();
  const updateService = useUpdateProviderService();
  const deleteService = useDeleteProviderService();
  const updateCategory = useProviderCategoryUpdate();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<ProviderWorkspaceService | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const services = serviceData?.services ?? [];
  const profile = dashboard?.profile;
  const loading = servicesLoading || dashboardLoading;
  const refreshBusy =
    servicesRefetching || dashboardRefetching || categoriesRefetching;
  const requestError = servicesError ?? dashboardError;

  const orderedServices = useMemo(
    () => [...services].sort((a, b) => a.name.localeCompare(b.name)),
    [services],
  );

  function openAddService() {
    setEditingService(null);
    setServiceName('');
    setServicePrice('');
    setServiceDescription('');
    setFormError(null);
    setEditorOpen(true);
  }

  function openEditService(service: ProviderWorkspaceService) {
    setEditingService(service);
    setServiceName(service.name);
    setServicePrice(service.price ? String(service.price) : '0');
    setServiceDescription(service.description ?? '');
    setFormError(null);
    setEditorOpen(true);
  }

  function closeEditor() {
    if (createService.isPending || updateService.isPending) {
      return;
    }

    setEditorOpen(false);
    setFormError(null);
  }

  async function saveService() {
    const name = serviceName.trim();
    const parsedPrice = Number(servicePrice.trim());

    if (!name) {
      setFormError('Enter a service name.');
      return;
    }

    if (
      servicePrice.trim() === '' ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0 ||
      parsedPrice > MAX_SERVICE_PRICE
    ) {
      setFormError('Enter a valid starting price between ₹0 and ₹10,00,000.');
      return;
    }

    const input: ProviderServiceInput = {
      name,
      price: Math.round(parsedPrice * 100) / 100,
      description: serviceDescription.trim() || undefined,
    };

    setFormError(null);
    setPageError(null);

    try {
      if (editingService) {
        await updateService.mutateAsync({
          serviceId: editingService.id,
          input,
        });
      } else {
        await createService.mutateAsync(input);
      }

      setEditorOpen(false);
    } catch (mutationError) {
      setFormError(errorMessage(mutationError));
    }
  }

  function confirmDelete(service: ProviderWorkspaceService) {
    if (deleteService.isPending) {
      return;
    }

    Alert.alert(
      'Remove service?',
      `${service.name} will stop appearing on your public Provider profile. Existing bookings are not deleted.`,
      [
        { text: 'Keep service', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setPageError(null);

            try {
              await deleteService.mutateAsync(service.id);
            } catch (mutationError) {
              setPageError(errorMessage(mutationError));
            }
          },
        },
      ],
    );
  }

  function requestCategoryChange(categoryId: number, categoryName: string) {
    if (!premium || updateCategory.isPending || categoryId === profile?.categoryId) {
      setCategoryOpen(false);
      return;
    }

    Alert.alert(
      'Change business category?',
      `Change your public Provider category to ${categoryName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Change category',
          onPress: async () => {
            setCategoryOpen(false);
            setPageError(null);

            try {
              await updateCategory.mutateAsync(categoryId);
            } catch (mutationError) {
              setPageError(errorMessage(mutationError));
            }
          },
        },
      ],
    );
  }

  async function refresh() {
    await Promise.all([
      refetchServices(),
      refetchDashboard(),
      refetchCategories(),
    ]);
  }

  return (
    <>
      <ScrollView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshBusy}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.surface}
          />
        }
      >
        {pageError ? (
          <AlertBanner variant="error">{pageError}</AlertBanner>
        ) : null}

        {loading ? (
          <ServicesSkeleton />
        ) : requestError ? (
          <View style={styles.errorBlock}>
            <AlertBanner variant="error">
              {errorMessage(requestError)}
            </AlertBanner>
            <Button
              label="Retry"
              loading={refreshBusy}
              onPress={refresh}
              fullWidth
            />
          </View>
        ) : (
          <>
            <Card style={styles.categoryCard}>
              <View style={styles.categoryTop}>
                <View style={styles.categoryIdentity}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: theme.colors.secondary },
                    ]}
                  >
                    <AppIcon
                      name="briefcase"
                      size={iconSize.md}
                      color={theme.colors.primary}
                      strokeWidth={2.2}
                    />
                  </View>

                  <View style={styles.flex}>
                    <AppText
                      variant="overline"
                      color={theme.colors.primary}
                    >
                      BUSINESS CATEGORY
                    </AppText>
                    <AppText variant="h2" style={styles.categoryName}>
                      {profile?.category || 'Category not assigned'}
                    </AppText>
                  </View>
                </View>

                <View
                  style={[
                    styles.categoryStat,
                    { backgroundColor: theme.colors.surfaceMuted },
                  ]}
                >
                  <AppText variant="h3" color={theme.colors.primary}>
                    {services.length}
                  </AppText>
                  <AppText variant="overline" muted>
                    SERVICES
                  </AppText>
                </View>
              </View>

              <View
                style={[
                  styles.categoryFooter,
                  { borderTopColor: theme.colors.border },
                ]}
              >
                <AppText variant="caption" muted style={styles.flex}>
                  {premium
                    ? 'Localsewa+ lets you update the category shown to customers.'
                    : 'Your approved category is locked for directory accuracy.'}
                </AppText>

                {premium ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setCategoryOpen(true)}
                    disabled={updateCategory.isPending}
                    style={({ pressed }) => [
                      styles.compactAction,
                      {
                        backgroundColor: pressed
                          ? theme.colors.secondary
                          : theme.colors.surfaceMuted,
                        borderColor: theme.colors.border,
                      },
                    ]}
                  >
                    <AppText variant="label" color={theme.colors.primary}>
                      Change
                    </AppText>
                  </Pressable>
                ) : null}
              </View>
            </Card>

            <View style={styles.catalogHeader}>
              <View style={styles.flex}>
                <AppText variant="h2">Services you provide</AppText>
                <AppText variant="caption" muted style={styles.smallGap}>
                  These services and starting prices are visible to customers.
                </AppText>
              </View>

              <View
                style={[
                  styles.countChip,
                  { backgroundColor: theme.colors.secondary },
                ]}
              >
                <AppText variant="label" color={theme.colors.primary}>
                  {services.length} {services.length === 1 ? 'service' : 'services'}
                </AppText>
              </View>
            </View>

            <Button
              label="Add service"
              icon="plus"
              variant="outline"
              onPress={openAddService}
              fullWidth
              style={styles.addButton}
            />

            {orderedServices.length ? (
              <View style={styles.serviceList}>
                {orderedServices.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    deleting={
                      deleteService.isPending &&
                      deleteService.variables === service.id
                    }
                    onEdit={() => openEditService(service)}
                    onRemove={() => confirmDelete(service)}
                  />
                ))}
              </View>
            ) : (
              <Card style={styles.emptyCard}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: theme.colors.secondary },
                  ]}
                >
                  <AppIcon
                    name="wrench"
                    size={iconSize.lg}
                    color={theme.colors.primary}
                  />
                </View>
                <AppText variant="title" style={styles.emptyTitle}>
                  No services added yet
                </AppText>
                <AppText variant="bodySmall" muted style={styles.emptyCopy}>
                  Add the services customers can request from your business.
                </AppText>
              </Card>
            )}
          </>
        )}
      </ScrollView>

      <ServiceEditorModal
        visible={editorOpen}
        editing={Boolean(editingService)}
        name={serviceName}
        price={servicePrice}
        description={serviceDescription}
        error={formError}
        saving={createService.isPending || updateService.isPending}
        onChangeName={setServiceName}
        onChangePrice={setServicePrice}
        onChangeDescription={setServiceDescription}
        onClose={closeEditor}
        onSave={saveService}
      />

      <CategoryPickerModal
        visible={categoryOpen}
        currentCategoryId={profile?.categoryId}
        categories={categories}
        busy={updateCategory.isPending}
        onClose={() => setCategoryOpen(false)}
        onSelect={requestCategoryChange}
      />
    </>
  );
}

function ServiceCard({
  service,
  deleting,
  onEdit,
  onRemove,
}: {
  service: ProviderWorkspaceService;
  deleting: boolean;
  onEdit: () => void;
  onRemove: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Card style={styles.serviceCard}>
      <View style={styles.serviceTop}>
        <View
          style={[
            styles.serviceIcon,
            { backgroundColor: theme.colors.secondary },
          ]}
        >
          <AppIcon
            name="wrench"
            size={iconSize.sm}
            color={theme.colors.primary}
          />
        </View>

        <View style={styles.flex}>
          <AppText variant="title" numberOfLines={2} style={styles.serviceName}>
            {service.name}
          </AppText>
          <AppText
            variant="label"
            color={theme.colors.primary}
            style={[styles.price, styles.servicePriceText]}
          >
            Starting {formatPrice(service.price)}
          </AppText>
        </View>
      </View>

      {service.description ? (
        <AppText
          variant="bodySmall"
          muted
          numberOfLines={2}
          style={[styles.serviceDescription, styles.serviceDescriptionText]}
        >
          {service.description}
        </AppText>
      ) : null}

      <View
        style={[
          styles.serviceActions,
          { borderTopColor: theme.colors.border },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onEdit}
          style={({ pressed }) => [
            styles.serviceAction,
            { backgroundColor: pressed ? theme.colors.secondary : 'transparent' },
          ]}
        >
          <AppIcon
            name="userEdit"
            size={iconSize.xs}
            color={theme.colors.primary}
          />
          <AppText variant="label" color={theme.colors.primary} style={styles.serviceActionText}>
            Edit
          </AppText>
        </Pressable>

        <View
          style={[
            styles.actionDivider,
            { backgroundColor: theme.colors.border },
          ]}
        />

        <Pressable
          accessibilityRole="button"
          disabled={deleting}
          onPress={onRemove}
          style={({ pressed }) => [
            styles.serviceAction,
            {
              backgroundColor: pressed ? '#FEF2F2' : 'transparent',
              opacity: deleting ? 0.55 : 1,
            },
          ]}
        >
          <AppIcon name="trash" size={iconSize.xs} color={theme.colors.error} />
          <AppText variant="label" color={theme.colors.error} style={styles.serviceActionText}>
            {deleting ? 'Removing…' : 'Remove'}
          </AppText>
        </Pressable>
      </View>
    </Card>
  );
}

function ServiceEditorModal({
  visible,
  editing,
  name,
  price,
  description,
  error,
  saving,
  onChangeName,
  onChangePrice,
  onChangeDescription,
  onClose,
  onSave,
}: {
  visible: boolean;
  editing: boolean;
  name: string;
  price: string;
  description: string;
  error: string | null;
  saving: boolean;
  onChangeName: (value: string) => void;
  onChangePrice: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.editorSheet,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.editorHeading}>
            <View style={styles.flex}>
              <AppText variant="h2">
                {editing ? 'Edit service' : 'Add service'}
              </AppText>
              <AppText variant="caption" muted style={styles.smallGap}>
                {editing
                  ? 'Update the service details customers see.'
                  : 'Add a service to your public Provider catalog.'}
              </AppText>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              disabled={saving}
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppIcon name="x" size={iconSize.sm} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.editorFields}
          >
            {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

            <Input
              label="Service name"
              value={name}
              onChangeText={onChangeName}
              maxLength={120}
              autoCapitalize="words"
              editable={!saving}
              placeholder="e.g. Website Development"
            />

            <Input
              label="Starting price"
              value={price}
              onChangeText={onChangePrice}
              keyboardType="decimal-pad"
              editable={!saving}
              placeholder="0"
              leftAccessory={
                <AppText variant="label" color={theme.colors.primary}>
                  ₹
                </AppText>
              }
            />

            <Input
              label="Description (optional)"
              value={description}
              onChangeText={onChangeDescription}
              multiline
              textAlignVertical="top"
              maxLength={500}
              editable={!saving}
              placeholder="Describe what is included"
              style={styles.descriptionInput}
            />
          </ScrollView>

          <View
            style={[
              styles.editorActions,
              { borderTopColor: theme.colors.border },
            ]}
          >
            <Button
              label="Cancel"
              variant="outline"
              disabled={saving}
              onPress={onClose}
              style={styles.flexButton}
            />
            <Button
              label={editing ? 'Save changes' : 'Add service'}
              loading={saving}
              onPress={onSave}
              style={styles.flexButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CategoryPickerModal({
  visible,
  currentCategoryId,
  categories,
  busy,
  onClose,
  onSelect,
}: {
  visible: boolean;
  currentCategoryId?: number;
  categories: Array<{ id: number; name: string }>;
  busy: boolean;
  onClose: () => void;
  onSelect: (id: number, name: string) => void;
}): React.JSX.Element {
  const { theme } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.categorySheet,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View style={styles.editorHeading}>
            <View style={styles.flex}>
              <AppText variant="h2">Business category</AppText>
              <AppText variant="caption" muted style={styles.smallGap}>
                Choose the category customers should discover you under.
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              disabled={busy}
              onPress={onClose}
              style={[
                styles.closeButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppIcon name="x" size={iconSize.sm} color={theme.colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.categoryList}>
            {categories.map(category => {
              const selected = category.id === currentCategoryId;

              return (
                <Pressable
                  key={category.id}
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => onSelect(category.id, category.name)}
                  style={({ pressed }) => [
                    styles.categoryRow,
                    {
                      backgroundColor: selected
                        ? theme.colors.secondary
                        : pressed
                        ? theme.colors.surfaceMuted
                        : theme.colors.surface,
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}
                >
                  <AppText variant="label" style={styles.flex}>
                    {category.name}
                  </AppText>
                  {selected ? (
                    <AppIcon
                      name="checkCircle"
                      size={iconSize.sm}
                      color={theme.colors.primary}
                    />
                  ) : (
                    <AppIcon
                      name="chevronRight"
                      size={iconSize.sm}
                      color={theme.colors.textMuted}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ServicesSkeleton(): React.JSX.Element {
  return (
    <View style={styles.skeletonStack}>
      <Skeleton height={130} radiusValue={PROVIDER_SURFACE_RADIUS} />
      <Skeleton height={48} radiusValue={24} />
      {[0, 1, 2].map(index => (
        <Skeleton
          key={index}
          height={150}
          radiusValue={PROVIDER_SURFACE_RADIUS}
        />
      ))}
    </View>
  );
}

function formatPrice(value: number): string {
  return `₹${Math.max(0, value).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: layout.screenHorizontal,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  flex: { flex: 1, minWidth: 0 },
  smallGap: { marginTop: spacing[1] },
  errorBlock: { gap: spacing[3] },
  categoryCard: {
    aspectRatio: 16 / 9,
    borderRadius: PROVIDER_SURFACE_RADIUS,
    padding: spacing[4],
    justifyContent: 'space-between',
  },
  categoryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[3],
  },
  categoryIdentity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { marginTop: spacing[1] },
  categoryStat: {
    minWidth: 72,
    minHeight: 68,
    borderRadius: radius.lg,
    paddingHorizontal: spacing[2],
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  categoryFooter: {
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  compactAction: {
    minHeight: 38,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  catalogHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
  },
  countChip: {
    minHeight: 32,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: { borderRadius: radius.pill, minHeight: 48 },
  serviceList: { gap: spacing[2] },
  serviceCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    paddingHorizontal: spacing[3],
    paddingTop: spacing[3],
    paddingBottom: 0,
    overflow: 'hidden',
  },
  serviceTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 15,
    lineHeight: 20,
  },
  price: { marginTop: 2 },
  servicePriceText: {
    fontSize: 12,
    lineHeight: 16,
  },
  serviceDescription: { marginTop: spacing[2], lineHeight: 17 },
  serviceDescriptionText: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  serviceActions: {
    marginTop: spacing[2],
    marginHorizontal: -spacing[3],
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  serviceAction: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  serviceActionText: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: spacing[2],
  },
  emptyCard: {
    borderRadius: PROVIDER_SURFACE_RADIUS,
    alignItems: 'center',
    paddingVertical: spacing[8],
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { marginTop: spacing[4] },
  emptyCopy: {
    marginTop: spacing[2],
    textAlign: 'center',
    maxWidth: 300,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5,17,13,0.42)',
    paddingHorizontal: layout.bottomSheetMargin,
    paddingBottom: layout.bottomSheetMargin,
  },
  editorSheet: {
    width: '100%',
    maxHeight: '88%',
    borderRadius: PROVIDER_SURFACE_RADIUS,
    borderWidth: 1,
    paddingTop: spacing[5],
    overflow: 'hidden',
  },
  categorySheet: {
    width: '100%',
    maxHeight: '76%',
    borderRadius: PROVIDER_SURFACE_RADIUS,
    borderWidth: 1,
    paddingTop: spacing[5],
    overflow: 'hidden',
  },
  editorHeading: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editorFields: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[5],
    gap: spacing[4],
  },
  descriptionInput: { minHeight: 112, paddingTop: spacing[3] },
  editorActions: {
    borderTopWidth: 1,
    padding: spacing[4],
    flexDirection: 'row',
    gap: spacing[3],
  },
  flexButton: { flex: 1 },
  categoryList: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[2],
  },
  categoryRow: {
    minHeight: 54,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  skeletonStack: { gap: spacing[4] },
});
