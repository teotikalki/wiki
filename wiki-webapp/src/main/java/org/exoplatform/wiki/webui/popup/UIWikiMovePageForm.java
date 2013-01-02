/*
 * Copyright (C) 2003-2010 eXo Platform SAS.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation; either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see<http://www.gnu.org/licenses/>.
 */
package org.exoplatform.wiki.webui.popup;

import java.util.List;
import java.util.ResourceBundle;

import org.apache.commons.lang.StringUtils;
import org.exoplatform.container.PortalContainer;
import org.exoplatform.web.application.ApplicationMessage;
import org.exoplatform.web.application.RequestContext;
import org.exoplatform.webui.commons.EventUIComponent;
import org.exoplatform.webui.commons.EventUIComponent.EVENTTYPE;
import org.exoplatform.webui.commons.UISpacesSwitcher;
import org.exoplatform.webui.config.annotation.ComponentConfig;
import org.exoplatform.webui.config.annotation.EventConfig;
import org.exoplatform.webui.core.UIPopupComponent;
import org.exoplatform.webui.core.UIPopupContainer;
import org.exoplatform.webui.core.lifecycle.UIFormLifecycle;
import org.exoplatform.webui.event.Event;
import org.exoplatform.webui.event.EventListener;
import org.exoplatform.webui.form.UIForm;
import org.exoplatform.webui.form.UIFormInputInfo;
import org.exoplatform.webui.form.UIFormStringInput;
import org.exoplatform.webui.form.UIFormTextAreaInput;
import org.exoplatform.wiki.commons.Utils;
import org.exoplatform.wiki.mow.api.Page;
import org.exoplatform.wiki.mow.api.Wiki;
import org.exoplatform.wiki.mow.core.api.wiki.PageImpl;
import org.exoplatform.wiki.rendering.RenderingService;
import org.exoplatform.wiki.service.WikiPageParams;
import org.exoplatform.wiki.service.WikiService;
import org.exoplatform.wiki.tree.TreeNode;
import org.exoplatform.wiki.tree.TreeNode.TREETYPE;
import org.exoplatform.wiki.tree.utils.TreeUtils;
import org.exoplatform.wiki.webui.UIWikiBreadCrumb;
import org.exoplatform.wiki.webui.UIWikiLocationContainer;
import org.exoplatform.wiki.webui.UIWikiPageEditForm;
import org.exoplatform.wiki.webui.UIWikiPageTitleControlArea;
import org.exoplatform.wiki.webui.UIWikiPortlet;
import org.exoplatform.wiki.webui.UIWikiPortlet.PopupLevel;
import org.exoplatform.wiki.webui.UIWikiRichTextArea;
import org.exoplatform.wiki.webui.WikiMode;
import org.exoplatform.wiki.webui.tree.UITreeExplorer;
import org.xwiki.rendering.syntax.Syntax;

/**
 * Created by The eXo Platform SAS
 * Author : Lai Trung Hieu
 *          hieu.lai@exoplatform.com
 * Aug 2, 2010  
 */
@ComponentConfig(
  lifecycle = UIFormLifecycle.class, 
  template = "app:/templates/wiki/webui/popup/UIWikiMovePageForm.gtmpl",
  events = {
    @EventConfig(listeners = UIWikiMovePageForm.CloseActionListener.class),
    @EventConfig(listeners = UIWikiMovePageForm.MoveActionListener.class),
    @EventConfig(listeners = UIWikiMovePageForm.SwitchSpaceActionListener.class),
    @EventConfig(listeners = UIWikiMovePageForm.RenameActionListener.class)
  }
)
public class UIWikiMovePageForm extends UIForm implements UIPopupComponent {
  
  final static public String PAGENAME_INFO      = "pageNameInfo";

  final static public String LOCATION_CONTAINER = "UIWikiLocationContainer";

  final static public String UITREE             = "UIMoveTree";
  
  public String              MOVE               = "Move";
  
  private static final String MOVE_PAGE_CONTAINER = "UIWikiMovePageForm";
  
  private static final String SWITCH_SPACE_ACTION = "SwitchSpace";
  
  private static final String SPACE_SWITCHER = "UISpaceSwitcher_UIWikiMovePageForm";
  
  private static final String RENAME_ACTION = "Rename";
  
  private List<PageImpl> duplicatedPages;
  
  private PageImpl pageToMove;
  
  public UIWikiMovePageForm() throws Exception {
    addChild(new UIFormInputInfo(PAGENAME_INFO, PAGENAME_INFO, null));
    addChild(UIWikiLocationContainer.class, null, LOCATION_CONTAINER);
    UITreeExplorer uiTree = addChild(UITreeExplorer.class, null, UITREE);

    EventUIComponent eventComponent = new EventUIComponent(LOCATION_CONTAINER,
                                                           UIWikiLocationContainer.CHANGE_NEWLOCATION,
                                                           EVENTTYPE.EVENT);
    StringBuilder initURLSb = new StringBuilder(Utils.getCurrentRestURL());
    initURLSb.append("/wiki/tree/").append(TREETYPE.ALL.toString());
    StringBuilder childrenURLSb = new StringBuilder(Utils.getCurrentRestURL());
    childrenURLSb.append("/wiki/tree/").append(TREETYPE.CHILDREN.toString());
    uiTree.init(initURLSb.toString(), childrenURLSb.toString(), getInitParam(Utils.getCurrentWikiPagePath()), eventComponent, false);
    
    // Init space switcher
    UISpacesSwitcher uiWikiSpaceSwitcher = addChild(UISpacesSwitcher.class, null, SPACE_SWITCHER);
    uiWikiSpaceSwitcher.setCurrentSpaceName(Utils.getCurrentSpaceName());
    EventUIComponent eventComponent1 = new EventUIComponent(MOVE_PAGE_CONTAINER, SWITCH_SPACE_ACTION, EVENTTYPE.EVENT);
    uiWikiSpaceSwitcher.init(eventComponent1);
  }
  
  protected String createDuplicatedPageNotification() throws Exception {
    if ((duplicatedPages == null) || duplicatedPages.isEmpty()) {
      return StringUtils.EMPTY;
    }
    
    RenderingService renderingService = (RenderingService) PortalContainer.getComponent(RenderingService.class);
    ResourceBundle bundle = RequestContext.getCurrentInstance().getApplicationResourceBundle();
    StringBuilder notifications = new StringBuilder();
    
    // Calculate the max display warning
    int maxWarning = 5;
    if (duplicatedPages.get(0).getName().equals(pageToMove.getName())) {
      maxWarning = 6;
    }
    
    // Get resource bundle
    String dupplicatedParentMessage = bundle.getString("UIWikiMovePageForm.msg.main-page-duplicate");
    String dupplicatedChildMessage = bundle.getString("UIWikiMovePageForm.msg.sub-page-duplicate");
    String renameActionLabel = bundle.getString("UIWikiMovePageForm.action.Rename");
    
    for (int i = 0; i < Math.min(duplicatedPages.size(), maxWarning); i++) {
      PageImpl page = duplicatedPages.get(i);
      // Build message markup
      String messageMarkup = dupplicatedChildMessage;
      if (pageToMove.getName().equals(page.getName())) {
        messageMarkup = dupplicatedParentMessage;
      }
      messageMarkup = "{{warning}}" + messageMarkup + "{{/warning}}";
      
      // Convert message markup to html
      String messageHTML = renderingService.render(messageMarkup, Syntax.XWIKI_2_0.toIdString(), Syntax.XHTML_1_0.toIdString(), false);
      
      // Add actions to message html
      String renameActionLink = event(RENAME_ACTION, page.getName());
      if (pageToMove.getName().equals(page.getName())) {
        messageHTML = messageHTML.replace("{0}", "<a title=\""+ renameActionLabel + "\" href=\"" + renameActionLink + "\">" + renameActionLabel + "</a>");
      } else {
        messageHTML = messageHTML.replace("{0}", page.getName());
        messageHTML = messageHTML.replace("{1}", "<a title=\""+ renameActionLabel + "\" href=\"" + renameActionLink + "\">" + renameActionLabel + "</a>");
      }
      
      // Append the notification
      notifications.append(messageHTML);
    }
    
    // Check to add "and more" label
    if (duplicatedPages.size() > maxWarning) {
      String andMoreLabel = bundle.getString("UIWikiMovePageForm.msg.and-more");
      andMoreLabel = "{{warning}}" + andMoreLabel + "{{/warning}}";
      andMoreLabel = renderingService.render(andMoreLabel, Syntax.XWIKI_2_0.toIdString(), Syntax.XHTML_1_0.toIdString(), false);
      notifications.append(andMoreLabel);
    }
    
    return notifications.toString();
  }
  
  public List<PageImpl> getDupplicatedPages() {
    return duplicatedPages;
  }

  public void setDupplicatedPages(List<PageImpl> dupplicatedPages) {
    this.duplicatedPages = dupplicatedPages;
  }

  static public class CloseActionListener extends EventListener<UIWikiMovePageForm> {
    public void execute(Event<UIWikiMovePageForm> event) throws Exception {  
      UIWikiPortlet wikiPortlet = event.getSource().getAncestorOfType(UIWikiPortlet.class);
      UIPopupContainer popupContainer = wikiPortlet.getPopupContainer(PopupLevel.L1);
      popupContainer.cancelPopupAction();    
    }
  } 
  
  static public class MoveActionListener extends EventListener<UIWikiMovePageForm> {
    public void execute(Event<UIWikiMovePageForm> event) throws Exception {   
      WikiService wservice = (WikiService) PortalContainer.getComponent(WikiService.class);
      UIWikiPortlet uiWikiPortlet = event.getSource().getAncestorOfType(UIWikiPortlet.class);
      UIWikiMovePageForm movePageForm = event.getSource();
      UIWikiLocationContainer locationContainer = movePageForm.findFirstComponentOfType(UIWikiLocationContainer.class);
      UIWikiBreadCrumb currentLocation = (UIWikiBreadCrumb) locationContainer.getChildById(UIWikiLocationContainer.CURRENT_LOCATION);
      UIWikiBreadCrumb newLocation = (UIWikiBreadCrumb) locationContainer.getChildById(UIWikiLocationContainer.NEW_LOCATION);
      WikiPageParams currentLocationParams = currentLocation.getPageParam();
      WikiPageParams newLocationParams = newLocation.getPageParam();
      
      if (newLocationParams==null) {
        event.getRequestContext()
             .getUIApplication()
             .addMessage(new ApplicationMessage("UIWikiMovePageForm.msg.new-location-can-not-be-empty",
                                                null,
                                                ApplicationMessage.WARNING));
        return;
      }
      
      //If exist page same with move page name in new location
      PageImpl movepage = (PageImpl) wservice.getPageById(currentLocationParams.getType(),
                                                          currentLocationParams.getOwner(),
                                                          currentLocationParams.getPageId());
      
      // If user move page across spaces
      if (!currentLocationParams.getType().equals(newLocationParams.getType()) ||
          !currentLocationParams.getOwner().equals(newLocationParams.getOwner())) {
        
        // Get the list of dupplicated page
        movePageForm.duplicatedPages = wservice.getDuplicatePages(movepage, wservice.getWiki(newLocationParams.getType(), newLocationParams.getOwner()), null);
        
        // If there're some dupplicated page then show warning and return
        if (movePageForm.duplicatedPages.size() > 0) {
          movePageForm.pageToMove = movepage;
          event.getRequestContext().addUIComponentToUpdateByAjax(movePageForm.getParent());
          return;
        }
      }
      
      // Move page
      boolean isMoved = wservice.movePage(currentLocationParams, newLocationParams);      
      if (!isMoved) {
        event.getRequestContext()
             .getUIApplication()
             .addMessage(new ApplicationMessage("UIWikiMovePageForm.msg.no-permission-at-destination", null, ApplicationMessage.WARNING));
        return;
      }
      
      // Redirect to new location
      UIPopupContainer popupContainer = uiWikiPortlet.getPopupContainer(PopupLevel.L1);    
      popupContainer.cancelPopupAction();
      newLocationParams.setPageId(currentLocationParams.getPageId());
      org.exoplatform.wiki.commons.Utils.redirect(newLocationParams, WikiMode.VIEW);
    }
  }

  public void activate() throws Exception {
  }
  
  public void deActivate() throws Exception {
  }
  
  private String getInitParam(String currentPath) throws Exception {
    StringBuilder sb = new StringBuilder();
    sb.append("?")
      .append(TreeNode.PATH)
      .append("=")
      .append(currentPath)
      .append("&")
      .append(TreeNode.CURRENT_PATH)
      .append("=")
      .append(currentPath);
    return sb.toString();
  }
  
  public static class SwitchSpaceActionListener extends EventListener<UIWikiMovePageForm> {
    public void execute(Event<UIWikiMovePageForm> event) throws Exception {
      String wikiId = event.getRequestContext().getRequestParameter(UISpacesSwitcher.SPACE_ID_PARAMETER);
      UIWikiMovePageForm uiWikiMovePageForm = event.getSource();
      UISpacesSwitcher uiWikiSpaceSwitcher = uiWikiMovePageForm.getChildById(SPACE_SWITCHER);
      WikiService wikiService = (WikiService) PortalContainer.getComponent(WikiService.class);
      
      Wiki wiki = wikiService.getWikiById(wikiId);
      Page wikiHome = wiki.getWikiHome();
      WikiPageParams params = new WikiPageParams(wiki.getType(), wiki.getOwner(), wikiHome.getName());
      uiWikiSpaceSwitcher.setCurrentSpaceName(wikiService.getWikiNameById(wikiId));
      
      // Change the init page of tree
      UITreeExplorer uiTree = uiWikiMovePageForm.getChildById(UITREE);
      uiTree.setInitParam(uiWikiMovePageForm.getInitParam(TreeUtils.getPathFromPageParams(params)));
      
      // Change the breadcrum
      UIWikiLocationContainer uiWikiLocationContainer = uiWikiMovePageForm.getChild(UIWikiLocationContainer.class);
      UIWikiBreadCrumb newlocation = uiWikiLocationContainer.getChildById(UIWikiLocationContainer.NEW_LOCATION);
      newlocation.setBreadCumbs(wikiService.getBreadcumb(params.getType(), params.getOwner(), params.getPageId()));
      
      event.getRequestContext().addUIComponentToUpdateByAjax(uiWikiMovePageForm.getParent());
    }
  }
  
  public static class RenameActionListener extends EventListener<UIWikiMovePageForm> {
    public void execute(Event<UIWikiMovePageForm> event) throws Exception {
      String pageId = event.getRequestContext().getRequestParameter(OBJECTID);
      UIWikiMovePageForm uiWikiMovePageForm = event.getSource();
      UIWikiPortlet wikiPortlet = uiWikiMovePageForm.getAncestorOfType(UIWikiPortlet.class);
      WikiService wikiService = (WikiService) PortalContainer.getComponent(WikiService.class);
      Wiki currentWiki = Utils.getCurrentWiki();
      PageImpl pageToRename = (PageImpl) wikiService.getPageById(currentWiki.getType(), currentWiki.getOwner(), pageId);
      
      // if page to rename does not exist then show the warning
      if (pageToRename == null) {
        event.getRequestContext().getUIApplication()
          .addMessage(new ApplicationMessage("UIWikiMovePageForm.msg.page-not-exist=", null, ApplicationMessage.WARNING));
        return;
      }
      
      // Feed data to edit form and redirect
      WikiPageParams targetParam = new WikiPageParams(currentWiki.getType(), currentWiki.getOwner(), pageToRename.getName());
      UIWikiPageEditForm pageEditForm = wikiPortlet.findFirstComponentOfType(UIWikiPageEditForm.class);
      UIFormStringInput titleInput = pageEditForm.getChild(UIWikiPageTitleControlArea.class).getUIStringInput();
      UIFormTextAreaInput markupInput = pageEditForm.findComponentById(UIWikiPageEditForm.FIELD_CONTENT);
      String title = pageToRename.getTitle();
      String content = pageToRename.getContent().getText();
      titleInput.setEditable(true);
      titleInput.setValue(title);
      pageEditForm.setTitle(title);
      markupInput.setValue(content);
      UIWikiRichTextArea wikiRichTextArea = pageEditForm.getChild(UIWikiRichTextArea.class);
      if (wikiRichTextArea.isRendered()) {
        Utils.feedDataForWYSIWYGEditor(pageEditForm, null);
      }
      
      UIPopupContainer popupContainer = wikiPortlet.getPopupContainer(PopupLevel.L1);    
      popupContainer.cancelPopupAction();
      wikiPortlet.changeMode(WikiMode.EDITPAGE);            
      Utils.ajaxRedirect(event, targetParam, WikiMode.EDITPAGE, null);
    }
  }
}

