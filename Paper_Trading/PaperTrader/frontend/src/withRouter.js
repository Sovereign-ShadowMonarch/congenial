import { useNavigate, useParams, useLocation } from 'react-router-dom';

export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let navigate = useNavigate();
    let params = useParams();
    let location = useLocation();
    
    // Create history object similar to React Router v5
    const history = {
      push: navigate,
      location: location,
      // Add other history methods if needed
    };
    
    return (
      <Component
        {...props}
        history={history}
        match={{ params }}
        location={location}
      />
    );
  }

  return ComponentWithRouterProp;
}
