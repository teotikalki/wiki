package org.exoplatform.wiki.service.wysiwyg;

import org.xwiki.component.annotation.Component;
import org.xwiki.gwt.wysiwyg.client.plugin.importer.ImportService;
import org.xwiki.gwt.wysiwyg.client.wiki.Attachment;

import java.util.Map;

/**
 * Created by The eXo Platform SEA
 * Author : eXoPlatform
 * toannh@exoplatform.com
 * On 5/7/15
 * Implement ImportService with default hint
 */
@Component
public class DefaultImportService implements ImportService{
  @Override
  public String cleanOfficeHTML(String htmlPaste, String cleanerHint, Map<String, String> cleaningParams) {
    return htmlPaste;
  }

  @Override
  public String officeToXHTML(Attachment attachment, Map<String, String> cleaningParams) {
    return null;
  }
}
