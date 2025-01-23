import React, { useState } from "react";
import { theme } from "../theme";
import { api } from "../../convex/_generated/api";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { MaterialIcons } from "@expo/vector-icons";
import { useQuery, useMutation } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import DocumentViewer from "../components/DocumentView";

const UserStatistics = () => {
  const stats = useQuery(api.users.getUserStatistics);

  if (!stats) {
    return <ActivityIndicator size="small" color={theme.colors.primary} />;
  }

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total Users</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.approved}</Text>
        <Text style={styles.statLabel}>Approved</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{stats.pending}</Text>
        <Text style={styles.statLabel}>Pending</Text>
      </View>
    </View>
  );
};

const DocumentModal = ({
  visible,
  storageId,
  onClose,
}: {
  visible: boolean;
  storageId: string;
  onClose: () => void;
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>User Document</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.documentContainer}>
          <DocumentViewer storageId={storageId} />
        </View>
      </View>
    </View>
  </Modal>
);

const DetailsModal = ({
  visible,
  user,
  onClose,
  handleCall,
}: {
  visible: boolean;
  user: any;
  onClose: () => void;
  handleCall: () => void;
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <ScrollView>
          <Text style={styles.modalTitle}>User Details</Text>
          <View style={styles.modalDetailsContainer}>
            <View style={styles.detailGroup}>
              <Text style={styles.detailLabel}>Name</Text>
              <Text style={styles.detailValue}>{user.name}</Text>
            </View>

            <View style={styles.detailGroup}>
              <Text style={styles.detailLabel}>Transport Company</Text>
              <Text style={styles.detailValue}>{user.transportName}</Text>
            </View>

            <View style={styles.detailGroup}>
              <Text style={styles.detailLabel}>User Type</Text>
              <Text style={styles.detailValue}>{user.userType}</Text>
            </View>

            <View style={styles.detailGroup}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <TouchableOpacity onPress={handleCall}>
                <Text style={[styles.detailValue, styles.phoneNumber]}>
                  {user.phone}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailGroup}>
              <Text style={styles.detailLabel}>Registration Date</Text>
              <Text style={styles.detailValue}>
                {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailGroup}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text
                style={[
                  styles.statusBadge,
                  user.isApproved ? styles.approvedBadge : styles.pendingBadge,
                ]}
              >
                {user.isApproved ? "Approved" : "Pending"}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const UserCard = ({
  user,
  onToggleApproval,
}: {
  user: any;
  onToggleApproval: (userId: Id<"users">, newStatus: boolean) => void;
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Add this state

  const handleCall = () => {
    Linking.openURL(`tel:${user.phone}`);
  };

  return (
    <View style={styles.card}>
      <DocumentModal
        visible={showDocumentModal}
        storageId={user.documentStorageId}
        onClose={() => setShowDocumentModal(false)}
      />

      <DetailsModal
        visible={showDetailsModal}
        user={user}
        onClose={() => setShowDetailsModal(false)}
        handleCall={handleCall}
      />

      <TouchableOpacity
        style={styles.headerContainer}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <MaterialIcons
              name="person"
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.userName}>{user.name}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.statusBadge,
                user.isApproved ? styles.approvedBadge : styles.pendingBadge,
              ]}
              onPress={(e) => {
                e.stopPropagation(); // Prevent expansion when clicking status
                onToggleApproval(user.id, !user.isApproved);
              }}
            >
              <MaterialIcons
                name={user.isApproved ? "check-circle" : "pending"}
                size={16}
                color={
                  user.isApproved ? theme.colors.success : theme.colors.warning
                }
              />
              <Text
                style={[
                  styles.statusText,
                  user.isApproved ? styles.approvedText : styles.pendingText,
                ]}
              >
                {user.isApproved ? "Approved" : "Pending"}
              </Text>
            </TouchableOpacity>
            <MaterialIcons
              name={isExpanded ? "expand-less" : "expand-more"}
              size={24}
              color={theme.colors.text}
              style={styles.expandIcon}
            />
          </View>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <>
          <View style={styles.mainInfo}>
            <View style={styles.infoRow}>
              <MaterialIcons
                name="local-shipping"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.infoLabel}>Transport:</Text>
              <Text style={styles.infoValue}>{user.transportName}</Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons
                name="badge"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{user.userType}</Text>
            </View>
          </View>

          <View style={styles.contactContainer}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <MaterialIcons
                name="phone"
                size={20}
                color={theme.colors.light}
              />
              <Text style={styles.contactText}>{user.phone}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => setShowDetailsModal(true)}
            >
              <MaterialIcons name="info" size={20} color={theme.colors.light} />
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.docContainer}>
            <TouchableOpacity
              style={styles.documentButton}
              onPress={() => setShowDocumentModal(true)}
            >
              <MaterialIcons
                name="description"
                size={20}
                color={theme.colors.light}
              />
              <Text style={styles.documentButtonText}>View Document</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export const UserManagement = () => {
  const users = useQuery(api.users.getAllUsers);
  const toggleApproval = useMutation(api.users.toggleUserApproval);

  const handleToggleApproval = async (
    userId: Id<"users">,
    newStatus: boolean
  ) => {
    try {
      await toggleApproval({ userId, isApproved: newStatus });
      Alert.alert(
        "Status Updated",
        `User has been ${newStatus ? "approved" : "unapproved"} successfully`
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update user status");
      console.error("Failed to toggle user approval:", error);
    }
  };

  if (!users) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UserStatistics />
      <FlashList
        data={users}
        renderItem={({ item }) => (
          <UserCard user={item} onToggleApproval={handleToggleApproval} />
        )}
        estimatedItemSize={200}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  headerContainer: {
    width: "100%",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandIcon: {
    marginLeft: theme.spacing.sm,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: theme.colors.light,
    padding: theme.spacing.md,
    borderRadius: 8,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.text,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.colors.light,
    borderRadius: 12,
    padding: theme.spacing.lg,
    width: "90%",
    maxWidth: 500,
    height: "80%",
    maxHeight: 600,
    alignSelf: "center",
  },
  documentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    textAlign: "center",
  },
  modalDetailsContainer: {
    marginBottom: theme.spacing.lg,
  },
  detailGroup: {
    marginBottom: theme.spacing.md,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.text,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500",
  },
  phoneNumber: {
    color: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.light,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  mainInfo: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
  },
  contactContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginRight: theme.spacing.sm,
  },
  contactText: {
    color: theme.colors.light,
    marginLeft: theme.spacing.sm,
    fontWeight: "500",
  },
  detailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginHorizontal: theme.spacing.sm,
  },
  detailsButtonText: {
    color: theme.colors.light,
    marginLeft: theme.spacing.sm,
    fontWeight: "500",
  },
  docContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
    marginRight: 8,
    marginLeft: -8,
  },
  documentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: 8,
    marginLeft: theme.spacing.sm,
  },
  documentButtonText: {
    color: theme.colors.light,
    marginLeft: theme.spacing.sm,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: `${theme.colors.success}20`,
  },
  pendingBadge: {
    backgroundColor: `${theme.colors.warning}20`,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  approvedText: {
    color: theme.colors.success,
  },
  pendingText: {
    color: theme.colors.warning,
  },
  separator: {
    height: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  closeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: 8,
  },
  closeButtonText: {
    color: theme.colors.light,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
