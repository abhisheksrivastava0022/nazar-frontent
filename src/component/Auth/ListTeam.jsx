import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  CircularProgress,
  Alert,
  Avatar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Person,
  Email,
  Phone,
  Business,
  LocationOn,
  CheckCircle,
  Cancel,
  Search,
  FilterList,
} from "@mui/icons-material";
import CustomSnackbar from "../library/CustomSnackbar";
import ApiClient from "../ApiClient";
import AddUser from "./AddUser";

const ListTeam = () => {
  const { getRequestApiwithLogin } = ApiClient();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertData, setAlertData] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      // Replace with your actual API call
      const response = await getRequestApiwithLogin("/delegate/team-member");
      if (response.status) {
        setTeamMembers(response.data);
      }

      setError(null);
    } catch (err) {
      setError("Failed to load team members");
      console.error("Error fetching team members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setEditMode(false);
    setAddUserOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditMode(true);
    setAddUserOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await ApiClient.delete(`/api/team-members/${userId}`);
        setAlertData({
          open: true,
          message: "User deleted successfully",
          severity: "success",
        });
        fetchTeamMembers(); // Refresh the list
      } catch (err) {
        setAlertData({
          open: true,
          message: "Failed to delete user",
          severity: "error",
        });
      }
    }
  };

  const handleCloseAddUser = () => {
    setAddUserOpen(false);
    setSelectedUser(null);
    setEditMode(false);
  };

  const handleSaveUser = (userData) => {
    // Handle save logic here
    setAlertData({
      open: true,
      message: editMode ? "User updated successfully" : "User added successfully",
      severity: "success",
    });
    fetchTeamMembers(); // Refresh the list
    handleCloseAddUser();
  };


  // Filter team members based on search term
  const filteredMembers = teamMembers.filter((member) =>
    Object.values(member).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Paginate data
  const paginatedMembers = filteredMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const columns = [
    { id: "avatar", label: "", minWidth: 60 },
    { id: "name", label: "Name", minWidth: 150 },
    { id: "email", label: "Email", minWidth: 200 },
    { id: "phone", label: "Phone", minWidth: 150 },

    { id: "status", label: "Status", minWidth: 100 },
    { id: "actions", label: "Actions", minWidth: 120 },
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <>
      <CustomSnackbar alertData={alertData} setAlertData={setAlertData} />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h1" fontWeight="bold">
                Team Members
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddUser}
                sx={{ textTransform: "none" }}
              >
                Add New Member
              </Button>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Search and Filter Bar */}
            <Paper sx={{ p: 2, mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  size="small"
                />
              </Box>
              <IconButton>
                <FilterList />
              </IconButton>
            </Paper>

            {/* Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="team members table">
                <TableHead>
                  <TableRow>
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        align="left"
                        style={{ minWidth: column.minWidth }}
                        sx={{ fontWeight: "bold", backgroundColor: "primary.light", color: "white" }}
                      >
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMembers.length > 0 ? (
                    paginatedMembers.map((member) => (
                      <TableRow hover key={member.id} tabIndex={-1}>
                        <TableCell>
                          <Avatar
                            src={member.avatar}
                            alt={member.first_name + member.last_name}
                            sx={{ width: 40, height: 40 }}
                          >
                            {member.first_name?.charAt(0)}
                          </Avatar>

                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {member.first_name + member.last_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Email fontSize="small" color="action" />
                            <Typography variant="body2">{member.email}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Phone fontSize="small" color="action" />
                            <Typography variant="body2">{member.mobile || "N/A"}</Typography>
                          </Stack>
                        </TableCell>


                        <TableCell>
                          <Chip
                            icon={member.status == "1" ? <CheckCircle /> : <Cancel />}
                            label={member.status == 1 ? "unverified Email" : "Verified Email"}
                            color={"success"}
                            size="small"
                            variant="outlined"

                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditUser(member)}
                              title="Edit"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(member.id)}
                              title="Delete"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                        <Typography color="textSecondary">
                          No team members found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

          </CardContent>
        </Card>
      </Container>

      {/* Add/Edit User Dialog */}
      <Dialog
        open={addUserOpen}
        onClose={handleCloseAddUser}
        maxWidth="md"
        fullWidth

      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            {editMode ? "Edit Team Member" : "Add New Team Member"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <AddUser
            userData={selectedUser}
            onSave={handleSaveUser}
            onCancel={handleCloseAddUser}
            editMode={editMode}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListTeam;