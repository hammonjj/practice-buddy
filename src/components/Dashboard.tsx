import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/AuthContext';
import { getPracticeSessions, getRoutines } from '../lib/localStorageDB';
import { PracticeSession, Routine } from '../models/models';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isWithinInterval, isSameDay, subDays, differenceInDays, addDays, startOfMonth, endOfMonth, getMonth, getYear, getDate, parseISO } from 'date-fns';
import { Clock, Calendar, TrendingUp, Award, Maximize, Target } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const { currentUser, userData, isLoading } = useFirebase();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'daily', 'weekly', 'monthly'
  const [streakCount, setStreakCount] = useState(0);
  const [totalPracticeMinutes, setTotalPracticeMinutes] = useState(0);
  const [averageSessionLength, setAverageSessionLength] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        // Get sessions from localStorage
        const sessionsData = getPracticeSessions(currentUser.id);
        setSessions(sessionsData);
        
        // Get routines
        const routinesData = getRoutines(currentUser.id);
        setRoutines(routinesData);
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [currentUser]);

  // Calculate statistics
  useEffect(() => {
    if (sessions.length > 0) {
      // Total minutes practiced
      const total = sessions.reduce((sum, session) => sum + session.totalDuration, 0);
      setTotalPracticeMinutes(total);
      
      // Average session length
      const avg = Math.round(total / sessions.length);
      setAverageSessionLength(avg);
      
      // Calculate streak
      const streak = calculateStreak(sessions);
      setStreakCount(streak);
      
      // Completion rate (based on weekly goals if set)
      if (userData?.settings?.weeklyGoalInMinutes) {
        const weeklyGoal = userData.settings.weeklyGoalInMinutes;
        const thisWeek = getSessionsInRange(sessions, startOfWeek(new Date()), endOfWeek(new Date()));
        const weekTotal = thisWeek.reduce((sum, session) => sum + session.totalDuration, 0);
        const rate = Math.min(100, Math.round((weekTotal / weeklyGoal) * 100));
        setCompletionRate(rate);
      }
    }
  }, [sessions, userData]);

  // Helper function to calculate streak
  const calculateStreak = (sessions: PracticeSession[]): number => {
    if (sessions.length === 0) return 0;
    
    // Sort sessions by date (newest first)
    const sortedSessions = [...sessions].sort((a, b) => b.date - a.date);
    
    // Get unique days with sessions
    const uniqueDays = new Set<string>();
    sortedSessions.forEach(session => {
      uniqueDays.add(format(new Date(session.date), 'yyyy-MM-dd'));
    });
    
    // Convert to array and sort
    const practiceDays = Array.from(uniqueDays).sort().reverse();
    
    // Check for most recent streak
    let streak = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    
    // Check if practiced today or yesterday to start the streak
    const startStreak = practiceDays[0] === today || practiceDays[0] === yesterday;
    
    if (startStreak) {
      streak = 1;
      
      // Count consecutive days
      for (let i = 1; i < practiceDays.length; i++) {
        const current = parseISO(practiceDays[i-1]);
        const previous = parseISO(practiceDays[i]);
        
        if (differenceInDays(current, previous) === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  // Helper function to get sessions in a date range
  const getSessionsInRange = (sessions: PracticeSession[], start: Date, end: Date): PracticeSession[] => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return isWithinInterval(sessionDate, { start, end });
    });
  };

  // Get sessions by day for the current week
  const getDailyData = () => {
    const start = startOfWeek(new Date());
    const end = endOfWeek(new Date());
    const days = eachDayOfInterval({ start, end });
    
    const labels = days.map(day => format(day, 'EEE'));
    const data = days.map(day => {
      const sessionsOnDay = sessions.filter(session => 
        isSameDay(new Date(session.date), day)
      );
      return sessionsOnDay.reduce((sum, session) => sum + session.totalDuration, 0);
    });
    
    return { labels, data };
  };

  // Get data for the past 4 weeks
  const getWeeklyData = () => {
    const weeks = [];
    let end = endOfWeek(new Date());
    
    for (let i = 0; i < 4; i++) {
      const start = startOfWeek(end);
      weeks.unshift({ start, end });
      end = subDays(start, 1);
    }
    
    const labels = weeks.map(week => 
      `${format(week.start, 'MMM d')} - ${format(week.end, 'MMM d')}`
    );
    const data = weeks.map(week => {
      const sessionsInWeek = getSessionsInRange(sessions, week.start, week.end);
      return sessionsInWeek.reduce((sum, session) => sum + session.totalDuration, 0);
    });
    
    return { labels, data };
  };

  // Get data by category
  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    
    sessions.forEach(session => {
      session.items.forEach(item => {
        if (!categories[item.category]) {
          categories[item.category] = 0;
        }
        categories[item.category] += item.durationInMinutes;
      });
    });
    
    const labels = Object.keys(categories);
    const data = Object.values(categories);
    
    // Generate colors based on the number of categories
    const colors = labels.map((_, index) => {
      const hue = (index * 137) % 360; // Golden angle to distribute colors
      return `hsl(${hue}, 70%, 60%)`;
    });
    
    return { labels, data, colors };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e4e7eb' // dim-100
        }
      },
      tooltip: {
        backgroundColor: '#323f4b', // dim-800
        titleColor: '#e4e7eb', // dim-100
        bodyColor: '#e4e7eb', // dim-100
        borderColor: '#52606d', // dim-600
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: '#3e4c59', // dim-700
        },
        ticks: {
          color: '#9aa5b1' // dim-300
        }
      },
      y: {
        grid: {
          color: '#3e4c59', // dim-700
        },
        ticks: {
          color: '#9aa5b1' // dim-300
        }
      }
    }
  };

  // Generate heat map data
  const generateHeatMapData = () => {
    const today = new Date();
    const start = subDays(today, 90); // Show last 90 days
    const days = eachDayOfInterval({ start, end: today });
    
    return days.map(day => {
      const sessionsOnDay = sessions.filter(session => 
        isSameDay(new Date(session.date), day)
      );
      const minutes = sessionsOnDay.reduce((sum, session) => sum + session.totalDuration, 0);
      
      let intensity = 0;
      if (minutes > 0) {
        if (minutes < 30) intensity = 1;
        else if (minutes < 60) intensity = 2;
        else if (minutes < 90) intensity = 3;
        else intensity = 4;
      }
      
      return {
        date: format(day, 'yyyy-MM-dd'),
        displayDate: format(day, 'MMM d'),
        dayOfWeek: format(day, 'E'),
        minutes,
        intensity
      };
    });
  };

  // Render heat map
  const renderHeatMap = () => {
    const heatMapData = generateHeatMapData();
    const weeks = [];
    
    // Group by week
    for (let i = 0; i < heatMapData.length; i += 7) {
      weeks.push(heatMapData.slice(i, i + 7));
    }
    
    // Fill in any missing days at the start
    const firstWeek = weeks[0];
    if (firstWeek.length < 7) {
      const firstDay = parseISO(firstWeek[0].date);
      const dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      for (let i = 0; i < dayOfWeek; i++) {
        const emptyDay = {
          date: '',
          displayDate: '',
          dayOfWeek: '',
          minutes: 0,
          intensity: -1 // Indicates an empty cell
        };
        firstWeek.unshift(emptyDay);
      }
    }
    
    return (
      <div className="mt-4">
        <div className="text-dim-300 text-sm mb-2">Practice Activity (Last 90 days)</div>
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="flex text-xs text-dim-400 mb-1">
              <div className="w-10"></div>
              <div className="w-8 text-center">Sun</div>
              <div className="w-8 text-center">Mon</div>
              <div className="w-8 text-center">Tue</div>
              <div className="w-8 text-center">Wed</div>
              <div className="w-8 text-center">Thu</div>
              <div className="w-8 text-center">Fri</div>
              <div className="w-8 text-center">Sat</div>
            </div>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex items-center h-8 mb-1">
                <div className="w-10 text-xs text-dim-400 pr-2">
                  {week.some(day => day.intensity >= 0) && 
                    format(parseISO(week.find(day => day.intensity >= 0)?.date || ''), 'MMM')}
                </div>
                {week.map((day, dayIndex) => (
                  <div 
                    key={`${weekIndex}-${dayIndex}`} 
                    className={`w-8 h-8 flex items-center justify-center rounded-sm mx-[1px] cursor-default
                      ${day.intensity === -1 ? 'opacity-0' : 
                        day.intensity === 0 ? 'bg-dim-700' : 
                        day.intensity === 1 ? 'bg-primary-900' : 
                        day.intensity === 2 ? 'bg-primary-800' : 
                        day.intensity === 3 ? 'bg-primary-700' : 
                        'bg-primary-600'}`}
                    title={day.intensity >= 0 ? `${day.displayDate}: ${day.minutes} minutes` : ''}
                  >
                    {day.intensity >= 0 && (
                      <span className="text-[10px] text-dim-300">
                        {getDate(parseISO(day.date))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end mt-2 text-xs">
          <span className="text-dim-400 mr-2">Less</span>
          <div className="w-4 h-4 bg-dim-700 rounded-sm"></div>
          <div className="w-4 h-4 bg-primary-900 rounded-sm ml-1"></div>
          <div className="w-4 h-4 bg-primary-800 rounded-sm ml-1"></div>
          <div className="w-4 h-4 bg-primary-700 rounded-sm ml-1"></div>
          <div className="w-4 h-4 bg-primary-600 rounded-sm ml-1"></div>
          <span className="text-dim-400 ml-2">More</span>
        </div>
      </div>
    );
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-dim-200">Loading...</div>
      </div>
    );
  }

  // Daily data chart
  const dailyData = getDailyData();
  const dailyChartData = {
    labels: dailyData.labels,
    datasets: [
      {
        label: 'Minutes Practiced',
        data: dailyData.data,
        backgroundColor: 'rgba(51, 122, 255, 0.5)',
        borderColor: '#337aff', // primary-400
        borderWidth: 2,
      },
    ],
  };

  // Weekly data chart
  const weeklyData = getWeeklyData();
  const weeklyChartData = {
    labels: weeklyData.labels,
    datasets: [
      {
        label: 'Minutes Practiced',
        data: weeklyData.data,
        backgroundColor: 'rgba(151, 128, 255, 0.5)',
        borderColor: '#9780ff', // accent-300
        borderWidth: 2,
      },
    ],
  };

  // Category data chart
  const categoryData = getCategoryData();
  const categoryChartData = {
    labels: categoryData.labels,
    datasets: [
      {
        data: categoryData.data,
        backgroundColor: categoryData.colors,
        borderColor: '#323f4b', // dim-800
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold text-dim-100 mb-6">Practice Dashboard</h1>
      
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-dim-800 rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dim-400 text-sm">Total Practice Time</p>
              <p className="text-2xl font-bold text-dim-100 mt-1">{totalPracticeMinutes} min</p>
            </div>
            <Clock className="h-10 w-10 text-primary-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dim-400 text-sm">Current Streak</p>
              <p className="text-2xl font-bold text-dim-100 mt-1">{streakCount} days</p>
            </div>
            <Award className="h-10 w-10 text-accent-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dim-400 text-sm">Average Session</p>
              <p className="text-2xl font-bold text-dim-100 mt-1">{averageSessionLength} min</p>
            </div>
            <TrendingUp className="h-10 w-10 text-primary-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-dim-800 rounded-lg shadow-md p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dim-400 text-sm">Weekly Goal Progress</p>
              <p className="text-2xl font-bold text-dim-100 mt-1">{completionRate}%</p>
            </div>
            <Target className="h-10 w-10 text-accent-500 opacity-80" />
          </div>
          {userData?.settings?.weeklyGoalInMinutes && (
            <div className="w-full bg-dim-700 rounded-full h-2 mt-2">
              <div 
                className="bg-primary-500 h-2 rounded-full"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-dim-700 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'overview' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dim-300 hover:text-dim-200'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'daily' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dim-300 hover:text-dim-200'
          }`}
          onClick={() => setActiveTab('daily')}
        >
          Daily
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'weekly' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dim-300 hover:text-dim-200'
          }`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm border-b-2 ${
            activeTab === 'categories' 
              ? 'border-primary-500 text-primary-400' 
              : 'border-transparent text-dim-300 hover:text-dim-200'
          }`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </div>
      
      {/* Tab content */}
      <div className="mb-8">
        {activeTab === 'overview' && (
          <div>
            <div className="bg-dim-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-dim-100 mb-4">Practice Activity</h2>
              {renderHeatMap()}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-dim-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-dim-100 mb-4">This Week</h2>
                <div className="h-64">
                  <Bar options={chartOptions} data={dailyChartData} />
                </div>
              </div>
              
              <div className="bg-dim-800 rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-dim-100 mb-4">Practice Categories</h2>
                <div className="h-64">
                  <Doughnut 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        legend: {
                          ...chartOptions.plugins.legend,
                          position: 'right'
                        }
                      }
                    }} 
                    data={categoryChartData} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'daily' && (
          <div className="bg-dim-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-dim-100 mb-4">Daily Practice</h2>
            <div className="h-80">
              <Bar options={chartOptions} data={dailyChartData} />
            </div>
          </div>
        )}
        
        {activeTab === 'weekly' && (
          <div className="bg-dim-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-dim-100 mb-4">Weekly Practice</h2>
            <div className="h-80">
              <Line options={chartOptions} data={weeklyChartData} />
            </div>
          </div>
        )}
        
        {activeTab === 'categories' && (
          <div className="bg-dim-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-dim-100 mb-4">Practice by Category</h2>
            <div className="h-80">
              <Doughnut 
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false
                }} 
                data={categoryChartData} 
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Recent sessions */}
      <div className="bg-dim-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-dim-700">
          <h2 className="text-xl font-semibold text-dim-100">Recent Practice Sessions</h2>
        </div>
        
        {sessions.length === 0 ? (
          <div className="p-6 text-center text-dim-400">
            You haven't recorded any practice sessions yet.
          </div>
        ) : (
          <ul className="divide-y divide-dim-700">
            {sessions.slice(0, 5).map((session) => (
              <li 
                key={session.id}
                className="px-6 py-4 hover:bg-dim-700 cursor-pointer transition"
                onClick={() => navigate(`/session/${session.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center mb-1">
                      <Calendar size={16} className="text-dim-400 mr-2" />
                      <span className="text-dim-100 font-medium">
                        {format(new Date(session.date), 'MMMM d, yyyy')}
                      </span>
                      {session.isSpontaneous && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-accent-900 text-accent-300">
                          Spontaneous
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-dim-400">
                      <Clock size={16} className="mr-2" />
                      <span>{session.totalDuration} minutes</span>
                    </div>
                  </div>
                  <div className="text-sm text-dim-400">
                    {session.items.length} {session.items.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;