import { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Movie as MovieIcon,
  Image as ImageIcon,
  VideoLibrary as ProjectIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
// Import project actions when created
// import { fetchProjects } from '../../store/slices/projectsSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  // Uncomment when projects slice is added
  // const { projects, isLoading } = useAppSelector((state) => state.projects);
  
  // Mock data for now
  const isLoading = false;
  const recentProjects = [
    {
      id: '1',
      title: 'Space Adventure',
      description: 'A journey through the stars',
      project_type: 'film',
      cover_image_url: null,
      created_at: '2023-10-15T12:00:00Z'
    },
    {
      id: '2',
      title: 'Tutorial: Web Development',
      description: 'Learn web development from scratch',
      project_type: 'faceless_youtube',
      cover_image_url: null,
      created_at: '2023-10-10T14:30:00Z'
    }
  ];

  // Fetch projects when component mounts
  useEffect(() => {
    // Uncomment when projects slice is added
    // dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Welcome back, {user?.username || 'Creator'}
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
        >
          New Project
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Stats Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Overview
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ProjectIcon sx={{ mr: 1, fontSize: 40 }} />
                      <Box>
                        <Typography variant="body2">Total Projects</Typography>
                        <Typography variant="h5">2</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MovieIcon sx={{ mr: 1, fontSize: 40 }} />
                      <Box>
                        <Typography variant="body2">Videos Created</Typography>
                        <Typography variant="h5">5</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ImageIcon sx={{ mr: 1, fontSize: 40 }} />
                      <Box>
                        <Typography variant="body2">Media Assets</Typography>
                        <Typography variant="h5">12</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        {/* Recent Projects */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Recent Projects
              </Typography>
              <Button 
                variant="text" 
                onClick={() => navigate('/projects')}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : recentProjects.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You don't have any projects yet
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/projects/new')}
                  sx={{ mt: 2 }}
                >
                  Create Your First Project
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {recentProjects.map((project) => (
                  <Grid item xs={12} sm={6} md={4} key={project.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'translateY(-4px)' }
                      }}
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <CardMedia
                        component="img"
                        height="140"
                        image={project.cover_image_url || `https://source.unsplash.com/random?${project.project_type}`}
                        alt={project.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h6" component="div">
                          {project.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {project.description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(project.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              bgcolor: 
                                project.project_type === 'film' ? 'primary.main' : 
                                project.project_type === 'cartoon' ? 'secondary.main' : 'info.main',
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1
                            }}
                          >
                            {project.project_type.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
